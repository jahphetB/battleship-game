import Gameboard, { BOARD_SIZE } from "../models/gameboard.js";
import { FLEET } from "./fleet.js";
export { FLEET_LENGTHS } from "./fleet.js";

// Owns fleet generation; Gameboard remains the authority on legal placement.
export default class FleetPlacement {
  constructor(random = Math.random) {
    this.random = random;
  }

  createBoard() {
    const board = new Gameboard();
    for (const { id, length } of FLEET) {
      const candidates = [];
      for (const horizontal of [true, false]) {
        for (let y = 0; y < BOARD_SIZE; y += 1) {
          for (let x = 0; x < BOARD_SIZE; x += 1) {
            const coordinates = Array.from({ length }, (_, offset) => [
              horizontal ? x + offset : x,
              horizontal ? y : y + offset,
            ]);
            if (board.canPlaceShip(length, coordinates)) candidates.push(coordinates);
          }
        }
      }
      // Sampling valid candidates avoids an unbounded random retry loop.
      const coordinates = candidates[Math.floor(this.random() * candidates.length)];
      if (!coordinates || !board.placeShip(length, coordinates, id)) {
        throw new Error("Unable to generate a legal fleet.");
      }
    }
    return board;
  }
}
