import ComputerStrategy from "./computerStrategy.js";

export default class EasyStrategy extends ComputerStrategy {
  nextAttack() {
    const adjacent = this.adjacentTargets();
    // Usually searches at random; follows a known hit only 35% of the time.
    if (adjacent.length > 0 && this.random() < 0.35) return this.pick(adjacent);
    return super.nextAttack();
  }
}
