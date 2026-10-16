import Player from "../models/player.js";
import { BOARD_SIZE } from "../models/gameboard.js";
import FleetPlacement, { FLEET_LENGTHS } from "./fleetPlacement.js";

export default class Game {
  constructor({ fleetPlacement = new FleetPlacement(), random = Math.random } = {}) {
    this.players = [new Player("human", "Player 1"), new Player("computer", "Computer")];
    this.fleetPlacement = fleetPlacement;
    this.random = random;
    this.activePlayerIndex = 0;
    this.readyPlayers = [false, false];
    this.pendingPhase = null;
    this.computerTargets = [];
    this.phase = "setup";
    this.mode = null;
    this.winnerIndex = null;
    this.lastShot = null;
  }

  get currentPlayer() {
    return this.players[this.activePlayerIndex];
  }

  get opponent() {
    return this.players[1 - this.activePlayerIndex];
  }

  get winner() {
    return this.winnerIndex === null ? null : this.players[this.winnerIndex];
  }

  setupGame({ mode = "computer" } = {}) {
    if (this.phase !== "setup" || !["computer", "human"].includes(mode)) return false;
    this.players = [
      new Player("human", "Player 1"),
      new Player(mode === "human" ? "human" : "computer", mode === "human" ? "Player 2" : "Computer"),
    ];
    for (const player of this.players) player.gameboard = this.fleetPlacement.createBoard();
    this.mode = mode;
    if (mode === "human") this.#beginHandoff(0, "placement");
    else this.phase = "placement";
    return true;
  }

  canRandomizeShips(playerIndex = this.activePlayerIndex) {
    return this.phase === "placement" && [0, 1].includes(playerIndex) &&
      !this.readyPlayers[playerIndex] && (this.mode === "computer" || playerIndex === this.activePlayerIndex);
  }

  randomizePlayerShips(playerIndex = this.activePlayerIndex) {
    if (!this.canRandomizeShips(playerIndex)) return false;
    this.players[playerIndex].gameboard = this.fleetPlacement.createBoard();
    return true;
  }

  hasReadyFleets() {
    return this.players.every(player => player.gameboard.hasCompleteFleet(FLEET_LENGTHS));
  }

  startBattle() {
    if (this.mode !== "computer" || this.phase !== "placement" || !this.hasReadyFleets()) return false;
    this.readyPlayers = [true, true];
    this.phase = "battle";
    return true;
  }

  confirmFleet() {
    if (this.mode !== "human" || this.phase !== "placement" ||
        this.readyPlayers[this.activePlayerIndex] ||
        !this.currentPlayer.gameboard.hasCompleteFleet(FLEET_LENGTHS)) return false;
    if (this.activePlayerIndex === 1 && !this.hasReadyFleets()) return false;
    this.readyPlayers[this.activePlayerIndex] = true;
    if (this.activePlayerIndex === 0) this.#beginHandoff(1, "placement");
    else {
      this.activePlayerIndex = 0;
      this.phase = "battle";
    }
    return true;
  }

  #beginHandoff(playerIndex, nextPhase) {
    this.activePlayerIndex = playerIndex;
    this.pendingPhase = nextPhase;
    this.phase = "handoff";
  }

  acknowledgeHandoff() {
    if (this.phase !== "handoff") return false;
    this.phase = this.pendingPhase;
    this.pendingPhase = null;
    return true;
  }

  attack(coordinates) {
    if (this.phase !== "battle" || this.currentPlayer.type !== "human") return { accepted: false };
    const board = this.opponent.gameboard;
    const outcome = board.receiveAttack(coordinates);
    if (outcome.accepted) {
      this.#recordShot(coordinates, outcome);
      this.#finishTurn(board);
    }
    return outcome;
  }

  computerAttack() {
    if (this.phase !== "battle" || this.currentPlayer.type !== "computer") return { accepted: false };
    const board = this.opponent.gameboard;
    let coordinates;
    while (this.computerTargets.length > 0 && !coordinates) {
      const target = this.computerTargets.shift();
      if (!board.hasAttackAt(target)) coordinates = target;
    }
    if (!coordinates) {
      const available = [];
      for (let y = 0; y < BOARD_SIZE; y += 1) {
        for (let x = 0; x < BOARD_SIZE; x += 1) {
          if (!board.hasAttackAt([x, y])) available.push([x, y]);
        }
      }
      if (available.length === 0) return { accepted: false };
      coordinates = available[Math.floor(this.random() * available.length)];
    }
    const outcome = board.receiveAttack(coordinates);
    if (outcome.accepted) {
      this.#recordShot(coordinates, outcome);
      if (outcome.hit) this.#queueAdjacentTargets(coordinates);
      this.#finishTurn(board);
    }
    return outcome;
  }

  #finishTurn(defendingBoard) {
    if (defendingBoard.allShipsSunk()) {
      this.winnerIndex = this.activePlayerIndex;
      this.phase = "completed";
    } else {
      this.activePlayerIndex = 1 - this.activePlayerIndex;
    }
  }

  #recordShot(coordinates, outcome) {
    this.lastShot = {
      playerIndex: this.activePlayerIndex,
      coordinates: [...coordinates],
      hit: outcome.hit,
      sunk: outcome.sunk,
    };
  }

  isGameOver() {
    return this.phase === "completed";
  }

  #queueAdjacentTargets([x, y]) {
    for (const [targetX, targetY] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) continue;
      if (!this.opponent.gameboard.hasAttackAt([targetX, targetY]) &&
          !this.computerTargets.some(([queuedX, queuedY]) => queuedX === targetX && queuedY === targetY)) {
        this.computerTargets.push([targetX, targetY]);
      }
    }
  }
}
