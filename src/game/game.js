import Player from "../models/player.js";
import { BOARD_SIZE } from "../models/gameboard.js";
import FleetPlacement, { FLEET_LENGTHS } from "./fleetPlacement.js";

export default class Game {
  constructor({ fleetPlacement = new FleetPlacement(), random = Math.random } = {}) {
    this.realPlayer = new Player("real");
    this.computerPlayer = new Player("computer");
    this.fleetPlacement = fleetPlacement;
    this.random = random;
    this.currentTurn = "real";
    this.computerTargets = [];
    this.phase = "setup";
    this.winner = null;
  }

  setupGame() {
    if (this.phase !== "setup") return false;
    this.realPlayer.gameboard = this.fleetPlacement.createBoard();
    this.computerPlayer.gameboard = this.fleetPlacement.createBoard();
    this.phase = "placement";
    return true;
  }

  canRandomizeShips() {
    return this.phase === "placement";
  }

  randomizePlayerShips(playerType = "real") {
    if (!this.canRandomizeShips()) return false;
    const player = playerType === "real" ? this.realPlayer :
      playerType === "computer" ? this.computerPlayer : null;
    if (!player) return false;
    player.gameboard = this.fleetPlacement.createBoard();
    return true;
  }

  startBattle() {
    if (this.phase !== "placement" ||
        !this.realPlayer.gameboard.hasCompleteFleet(FLEET_LENGTHS) ||
        !this.computerPlayer.gameboard.hasCompleteFleet(FLEET_LENGTHS)) return false;
    this.phase = "battle";
    return true;
  }

  attack(coordinates) {
    if (this.phase !== "battle" || this.currentTurn !== "real") return { accepted: false };
    const outcome = this.computerPlayer.gameboard.receiveAttack(coordinates);
    if (outcome.accepted) this.finishTurn("real", this.computerPlayer.gameboard, "computer");
    return outcome;
  }

  computerAttack() {
    if (this.phase !== "battle" || this.currentTurn !== "computer") return { accepted: false };
    const board = this.realPlayer.gameboard;
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
      if (outcome.hit) this.queueAdjacentTargets(coordinates);
      this.finishTurn("computer", board, "real");
    }
    return outcome;
  }

  finishTurn(attacker, defendingBoard, nextTurn) {
    if (defendingBoard.allShipsSunk()) {
      this.winner = attacker;
      this.phase = "completed";
    } else {
      this.currentTurn = nextTurn;
    }
  }

  isGameOver() {
    return this.phase === "completed";
  }

  queueAdjacentTargets([x, y]) {
    for (const [targetX, targetY] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) continue;
      if (!this.realPlayer.gameboard.hasAttackAt([targetX, targetY]) &&
          !this.computerTargets.some(([queuedX, queuedY]) => queuedX === targetX && queuedY === targetY)) {
        this.computerTargets.push([targetX, targetY]);
      }
    }
  }
}
