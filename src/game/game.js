import Player from "../models/player.js";
import Gameboard from "../models/gameboard.js";
import FleetPlacement, { FLEET_LENGTHS } from "./fleetPlacement.js";
import ManualPlacement from "./manualPlacement.js";
import createComputerStrategy, { DIFFICULTIES } from "./computer/createComputerStrategy.js";

export default class Game {
  constructor({ fleetPlacement = new FleetPlacement(), manualPlacement = new ManualPlacement(), strategyFactory = createComputerStrategy, random = Math.random } = {}) {
    this.players = [new Player("human", "Player 1"), new Player("computer", "Computer")];
    this.fleetPlacement = fleetPlacement;
    this.manualPlacement = manualPlacement;
    this.random = random;
    this.strategyFactory = strategyFactory;
    this.computerStrategy = null;
    this.difficulty = null;
    this.activePlayerIndex = 0;
    this.readyPlayers = [false, false];
    this.pendingPhase = null;
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

  setupGame({ mode = "computer", difficulty = "easy" } = {}) {
    if (this.phase !== "setup" || !["computer", "human"].includes(mode) ||
        (mode === "computer" && !DIFFICULTIES.includes(difficulty))) return false;
    this.players = [
      new Player("human", "Player 1"),
      new Player(mode === "human" ? "human" : "computer", mode === "human" ? "Player 2" : "Computer"),
    ];
    for (const player of this.players) player.gameboard = this.fleetPlacement.createBoard();
    this.mode = mode;
    this.difficulty = mode === "computer" ? difficulty : null;
    this.computerStrategy = mode === "computer" ? this.strategyFactory(difficulty, this.random) : null;
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

  clearPlayerFleet() {
    if (!this.canRandomizeShips()) return false;
    this.currentPlayer.gameboard = new Gameboard();
    return true;
  }

  previewPlayerShip(shipId, origin, orientation) {
    if (!this.canRandomizeShips()) return { valid: false, coordinates: [] };
    return this.manualPlacement.preview(this.currentPlayer.gameboard, shipId, origin, orientation);
  }

  placePlayerShip(shipId, origin, orientation) {
    if (!this.canRandomizeShips()) return false;
    return this.manualPlacement.place(this.currentPlayer.gameboard, shipId, origin, orientation);
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
    const coordinates = this.computerStrategy.nextAttack();
    if (!coordinates) return { accepted: false };
    const outcome = board.receiveAttack(coordinates);
    if (outcome.accepted) {
      this.#recordShot(coordinates, outcome);
      this.computerStrategy.recordResult(coordinates, {
        hit: outcome.hit, sunk: outcome.sunk,
        ...(outcome.sunkShip ? { sunkShip: outcome.sunkShip } : {}),
      });
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
}
