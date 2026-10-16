import Game from "./game.js";
import FleetPlacement from "./fleetPlacement.js";
import { DIFFICULTIES } from "./computer/createComputerStrategy.js";

test.each(DIFFICULTIES)("%s is selected before play and configuration locks after setup", difficulty => {
  const game = new Game();
  expect(game.setupGame({ difficulty })).toBe(true);
  expect(game.difficulty).toBe(difficulty);
  const strategy = game.computerStrategy;
  expect(game.setupGame({ difficulty: "hard" })).toBe(false);
  expect(game.computerStrategy).toBe(strategy);
  expect(game.difficulty).toBe(difficulty);
});

test("invalid difficulties leave setup and fleet state untouched", () => {
  const fleetPlacement = { createBoard: jest.fn() };
  const game = new Game({ fleetPlacement });
  expect(game.setupGame({ difficulty: "impossible" })).toBe(false);
  expect(game.setupGame({ difficulty: "toString" })).toBe(false);
  expect(fleetPlacement.createBoard).not.toHaveBeenCalled();
  expect(game.phase).toBe("setup");
  expect(game.difficulty).toBeNull();
});

test("local mode never creates or invokes a computer strategy", () => {
  const strategyFactory = jest.fn();
  const game = new Game({ strategyFactory });
  game.setupGame({ mode: "human", difficulty: "hard" });
  expect(game.difficulty).toBeNull();
  expect(game.computerStrategy).toBeNull();
  expect(strategyFactory).not.toHaveBeenCalled();
  game.acknowledgeHandoff();
  game.confirmFleet();
  game.acknowledgeHandoff();
  game.confirmFleet();
  game.attack([9, 9]);
  expect(game.computerAttack()).toEqual({ accepted: false });
  expect(strategyFactory).not.toHaveBeenCalled();
});

test("the game passes only earned results, including sunk cells after the final hit", () => {
  const strategy = { nextAttack: jest.fn(), recordResult: jest.fn() };
  const game = new Game({ strategyFactory: () => strategy, fleetPlacement: new FleetPlacement(() => 0) });
  game.setupGame({ difficulty: "hard" });
  game.startBattle();
  const cells = game.players[0].gameboard.ships[0].coordinates.map(cell => [...cell]);
  for (let index = 0; index < cells.length; index += 1) {
    game.attack([index, 9]);
    strategy.nextAttack.mockReturnValue(cells[index]);
    expect(game.computerAttack().accepted).toBe(true);
    expect(strategy.nextAttack).toHaveBeenLastCalledWith();
    const result = strategy.recordResult.mock.lastCall[1];
    expect(Object.keys(result).sort()).toEqual(index < cells.length - 1 ? ["hit", "sunk"] : ["hit", "sunk", "sunkShip"]);
    if (index < cells.length - 1) expect(result).toEqual({ hit: true, sunk: false });
    else expect(result.sunkShip).toEqual({ length: 5, coordinates: cells });
  }
  expect(strategy.recordResult).toHaveBeenCalledTimes(5);
});

test("a rejected strategy choice neither advances turns nor records a result", () => {
  const strategy = { nextAttack: () => [10, 0], recordResult: jest.fn() };
  const game = new Game({ strategyFactory: () => strategy });
  game.setupGame();
  game.startBattle();
  game.attack([9, 9]);
  expect(game.computerAttack()).toEqual({ accepted: false });
  expect(game.activePlayerIndex).toBe(1);
  expect(strategy.recordResult).not.toHaveBeenCalled();
});
