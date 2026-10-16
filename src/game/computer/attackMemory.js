import { BOARD_SIZE } from "../../models/gameboard.js";
import { FLEET_LENGTHS } from "../fleet.js";

export const coordinateKey = ([x, y]) => `${x},${y}`;
export const inBounds = ([x, y]) => Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;

// Stores earned observations only. No board or ship objects enter this class.
export default class AttackMemory {
  #shots = new Map();
  #remainingLengths = [...FLEET_LENGTHS];

  stateAt(coordinate) {
    return this.#shots.get(coordinateKey(coordinate));
  }

  get remainingLengths() {
    return [...this.#remainingLengths];
  }

  get available() {
    const cells = [];
    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        if (!this.stateAt([x, y])) cells.push([x, y]);
      }
    }
    return cells;
  }

  get hits() {
    return [...this.#shots].filter(([, state]) => state === "hit")
      .map(([key]) => key.split(",").map(Number));
  }

  recordResult(coordinate, { hit, sunk, sunkShip }) {
    if (!inBounds(coordinate) || this.stateAt(coordinate)) return;
    this.#shots.set(coordinateKey(coordinate), hit ? "hit" : "miss");
    if (!sunk || !sunkShip || sunkShip.coordinates.length !== sunkShip.length ||
        !sunkShip.coordinates.every(cell => this.stateAt(cell) === "hit")) return;
    for (const cell of sunkShip.coordinates) this.#shots.set(coordinateKey(cell), "sunk");
    const index = this.#remainingLengths.indexOf(sunkShip.length);
    if (index !== -1) this.#remainingLengths.splice(index, 1);
  }
}
