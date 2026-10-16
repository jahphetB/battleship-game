import ComputerStrategy from "./computerStrategy.js";

export default class MediumStrategy extends ComputerStrategy {
  nextAttack() {
    const lines = this.lineTargets();
    if (lines.length > 0) return this.pick(lines);
    const adjacent = this.adjacentTargets();
    if (adjacent.length > 0) return this.pick(adjacent);
    const available = this.memory.available;
    const checkerboard = available.filter(([x, y]) => (x + y) % 2 === 0);
    return this.pick(checkerboard.length > 0 ? checkerboard : available);
  }
}
