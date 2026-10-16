import { BOARD_SIZE } from "../../models/gameboard.js";
import { coordinateKey } from "./attackMemory.js";
import ComputerStrategy from "./computerStrategy.js";

export default class HardStrategy extends ComputerStrategy {
  nextAttack() {
    const available = this.memory.available;
    if (available.length === 0) return null;
    // A rare unfocused choice adds variety without firing at known cells.
    if (this.random() < 0.03) return this.pick(available);
    const placements = [];
    let mostHits = 0;
    for (const length of this.memory.remainingLengths) {
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        for (let y = 0; y + dy * (length - 1) < BOARD_SIZE; y += 1) {
          for (let x = 0; x + dx * (length - 1) < BOARD_SIZE; x += 1) {
            const cells = Array.from({ length }, (_, offset) => [x + dx * offset, y + dy * offset]);
            if (cells.some(cell => ["miss", "sunk"].includes(this.memory.stateAt(cell)))) continue;
            const hits = cells.filter(cell => this.memory.stateAt(cell) === "hit").length;
            mostHits = Math.max(mostHits, hits);
            placements.push({ cells, hits });
          }
        }
      }
    }
    const scores = new Map(available.map(cell => [coordinateKey(cell), 0]));
    for (const { cells, hits } of placements) {
      if (hits !== mostHits) continue;
      for (const cell of cells) {
        const key = coordinateKey(cell);
        if (scores.has(key)) scores.set(key, scores.get(key) + 1);
      }
    }
    const best = Math.max(...scores.values());
    return this.pick(available.filter(cell => scores.get(coordinateKey(cell)) === best));
  }
}
