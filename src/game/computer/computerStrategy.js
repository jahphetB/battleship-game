import AttackMemory, { coordinateKey, inBounds } from "./attackMemory.js";

// Common nextAttack()/recordResult() contract for interchangeable strategies.
export default class ComputerStrategy {
  constructor(random = Math.random) {
    this.random = random;
    this.memory = new AttackMemory();
  }

  recordResult(coordinate, outcome) {
    this.memory.recordResult(coordinate, outcome);
  }

  nextAttack() {
    return this.pick(this.memory.available);
  }

  pick(coordinates) {
    if (coordinates.length === 0) return null;
    return [...coordinates[Math.floor(this.random() * coordinates.length)]];
  }

  adjacentTargets() {
    const candidates = new Map();
    for (const [x, y] of this.memory.hits) {
      for (const cell of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
        if (inBounds(cell) && !this.memory.stateAt(cell)) candidates.set(coordinateKey(cell), cell);
      }
    }
    return [...candidates.values()];
  }

  lineTargets() {
    const candidates = new Map();
    for (const [x, y] of this.memory.hits) {
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        if (this.memory.stateAt([x + dx, y + dy]) !== "hit") continue;
        for (const direction of [-1, 1]) {
          let cell = [x, y];
          while (inBounds(cell) && this.memory.stateAt(cell) === "hit") {
            cell = [cell[0] + dx * direction, cell[1] + dy * direction];
          }
          if (inBounds(cell) && !this.memory.stateAt(cell)) candidates.set(coordinateKey(cell), cell);
        }
      }
    }
    return [...candidates.values()];
  }
}
