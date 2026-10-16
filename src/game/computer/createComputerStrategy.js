import EasyStrategy from "./easyStrategy.js";
import MediumStrategy from "./mediumStrategy.js";
import HardStrategy from "./hardStrategy.js";

export const DIFFICULTIES = Object.freeze(["easy", "medium", "hard"]);

export default function createComputerStrategy(difficulty, random = Math.random) {
  const strategies = { easy: EasyStrategy, medium: MediumStrategy, hard: HardStrategy };
  if (!DIFFICULTIES.includes(difficulty)) throw new Error("Unknown computer difficulty.");
  return new strategies[difficulty](random);
}
