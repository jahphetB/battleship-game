import createComputerStrategy, { DIFFICULTIES } from "./createComputerStrategy.js";
import FleetPlacement from "../fleetPlacement.js";

const hit = { hit: true, sunk: false };
const miss = { hit: false, sunk: false };

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test.each(DIFFICULTIES)("%s attacks every cell at most once and handles exhaustion", difficulty => {
  const strategy = createComputerStrategy(difficulty, () => 0.5);
  const shots = new Set();
  for (let turn = 0; turn < 100; turn += 1) {
    const coordinate = strategy.nextAttack();
    expect(coordinate.every(value => Number.isInteger(value) && value >= 0 && value < 10)).toBe(true);
    expect(shots.has(coordinate.join(","))).toBe(false);
    shots.add(coordinate.join(","));
    strategy.recordResult(coordinate, miss);
  }
  expect(strategy.nextAttack()).toBeNull();
});

test("easy sometimes follows hits and sometimes overlooks them", () => {
  const focused = createComputerStrategy("easy", () => 0);
  const distracted = createComputerStrategy("easy", () => 0.9);
  for (const strategy of [focused, distracted]) strategy.recordResult([4, 4], hit);
  expect(focused.nextAttack()).toEqual([5, 4]);
  const [x, y] = distracted.nextAttack();
  expect(Math.abs(x - 4) + Math.abs(y - 4)).toBeGreaterThan(1);
});

test.each(["medium", "hard"])("%s targets an adjacent cell after a hit", difficulty => {
  const strategy = createComputerStrategy(difficulty, () => 0.5);
  strategy.recordResult([4, 4], hit);
  const [x, y] = strategy.nextAttack();
  expect(Math.abs(x - 4) + Math.abs(y - 4)).toBe(1);
});

test.each([
  ["medium", [[4, 4], [5, 4]], [3, 4], [6, 4]],
  ["hard", [[4, 4], [5, 4]], [3, 4], [6, 4]],
  ["medium", [[4, 4], [4, 5]], [4, 3], [4, 6]],
  ["hard", [[4, 4], [4, 5]], [4, 3], [4, 6]],
])("%s infers direction and avoids a missed end %#", (difficulty, hits, missedEnd, expected) => {
  const strategy = createComputerStrategy(difficulty, () => 0.5);
  hits.forEach(coordinate => strategy.recordResult(coordinate, hit));
  strategy.recordResult(missedEnd, miss);
  expect(strategy.nextAttack()).toEqual(expected);
});

test.each(["medium", "hard"])("%s drops sunk targets but retains unrelated touching hits", difficulty => {
  const strategy = createComputerStrategy(difficulty, () => 0.5);
  strategy.recordResult([4, 4], hit);
  strategy.recordResult([4, 5], hit);
  strategy.recordResult([5, 4], { hit: true, sunk: true, sunkShip: { length: 2, coordinates: [[4, 4], [5, 4]] } });
  expect(strategy.memory.hits).toEqual([[4, 5]]);
  expect(strategy.memory.remainingLengths).toEqual([5, 4, 3, 3]);
  const [x, y] = strategy.nextAttack();
  expect(Math.abs(x - 4) + Math.abs(y - 5)).toBe(1);
});

test("sinking one length-three ship preserves the other fleet slot", () => {
  const strategy = createComputerStrategy("hard");
  strategy.recordResult([0, 0], hit);
  strategy.recordResult([1, 0], hit);
  strategy.recordResult([2, 0], { hit: true, sunk: true, sunkShip: { length: 3, coordinates: [[0, 0], [1, 0], [2, 0]] } });
  expect(strategy.memory.remainingLengths.filter(length => length === 3)).toHaveLength(1);
});

test("hard prefers well-supported cells and rarely makes an unfocused legal choice", () => {
  const focused = createComputerStrategy("hard", () => 0.5);
  const distracted = createComputerStrategy("hard", () => 0.01);
  expect(focused.nextAttack().every(value => [4, 5].includes(value))).toBe(true);
  focused.recordResult([4, 4], hit);
  distracted.recordResult([4, 4], hit);
  expect(distracted.nextAttack()).toEqual([0, 0]);
  const [x, y] = focused.nextAttack();
  expect(Math.abs(x - 4) + Math.abs(y - 4)).toBe(1);
});

test.each(DIFFICULTIES)("%s depends only on earned observations and protects memory snapshots", difficulty => {
  const first = createComputerStrategy(difficulty, seededRandom(42));
  const second = createComputerStrategy(difficulty, seededRandom(42));
  const coordinate = [4, 4];
  for (const strategy of [first, second]) strategy.recordResult(coordinate, hit);
  coordinate[0] = 9;
  first.memory.hits[0][0] = 9;
  first.memory.remainingLengths.pop();
  expect(first.memory.hits).toEqual([[4, 4]]);
  expect(first.memory.remainingLengths).toHaveLength(5);
  expect(first.nextAttack()).toEqual(second.nextAttack());
});

test("seeded complete fleets show progressively stronger targeting without repeated or invalid shots", () => {
  const totals = { easy: 0, medium: 0, hard: 0 };
  for (let seed = 1; seed <= 30; seed += 1) {
    for (const difficulty of DIFFICULTIES) {
      const board = new FleetPlacement(seededRandom(seed)).createBoard();
      const strategy = createComputerStrategy(difficulty, seededRandom(seed + 1000));
      let shots = 0;
      while (!board.allShipsSunk() && shots < 100) {
        const coordinate = strategy.nextAttack();
        expect(coordinate).not.toBeNull();
        const outcome = board.receiveAttack(coordinate);
        expect(outcome.accepted).toBe(true);
        strategy.recordResult(coordinate, outcome);
        shots += 1;
      }
      expect(board.allShipsSunk()).toBe(true);
      totals[difficulty] += shots;
    }
  }
  expect(totals.medium).toBeLessThan(totals.easy);
  expect(totals.hard).toBeLessThan(totals.medium);
});
