import Game from "./game.js";
import FleetPlacement from "./fleetPlacement.js";

function finishedGame({ mode = "computer", difficulty = "easy", winnerIndex = 0 } = {}) {
  const game = new Game({ fleetPlacement: new FleetPlacement(() => 0), random: () => 0 });
  game.setupGame({ mode, difficulty });
  if (mode === "human") {
    game.acknowledgeHandoff();
    game.confirmFleet();
    game.acknowledgeHandoff();
    game.confirmFleet();
  } else game.startBattle();

  game.activePlayerIndex = winnerIndex;
  const defender = game.opponent.gameboard;
  const remaining = defender.ships.flatMap(ship => ship.coordinates);
  const last = remaining.pop();
  remaining.forEach(cell => defender.receiveAttack(cell));
  if (mode === "computer" && winnerIndex === 1) {
    game.computerStrategy = { nextAttack: () => last, recordResult: jest.fn() };
    game.computerAttack();
  } else game.attack(last);
  expect(game.phase).toBe("completed");
  return game;
}

test("replay is available only after completion and creates fresh same-level state", () => {
  const game = new Game();
  expect(game.restartRound()).toBe(false);
  game.setupGame({ difficulty: "medium" });
  const originalStrategy = game.computerStrategy;
  expect(game.restartRound()).toBe(false);
  game.startBattle();
  expect(game.restartRound()).toBe(false);
  const defender = game.players[1].gameboard;
  const cells = defender.ships.flatMap(ship => ship.coordinates);
  const last = cells.pop();
  cells.forEach(cell => defender.receiveAttack(cell));
  game.attack(last);
  const oldBoards = game.players.map(player => player.gameboard);
  expect(game.restartRound()).toBe(true);
  expect(game).toMatchObject({ phase: "placement", mode: "computer", difficulty: "medium",
    activePlayerIndex: 0, readyPlayers: [false, false], winnerIndex: null, lastShot: null });
  expect(game.computerStrategy).not.toBe(originalStrategy);
  game.players.forEach((player, index) => {
    expect(player.gameboard).not.toBe(oldBoards[index]);
    expect(player.gameboard.successfulAttacks).toEqual([]);
    expect(player.gameboard.missedAttacks).toEqual([]);
  });
});

test("a computer victory advances one level, while a loss and final level cannot advance", () => {
  const victory = finishedGame({ difficulty: "easy" });
  expect(victory.advanceLevel()).toBe(true);
  expect(victory).toMatchObject({ phase: "placement", difficulty: "medium", winnerIndex: null });
  expect(victory.advanceLevel()).toBe(false);
  expect(finishedGame({ difficulty: "medium", winnerIndex: 1 }).advanceLevel()).toBe(false);
  expect(finishedGame({ difficulty: "hard" }).advanceLevel()).toBe(false);
});

test("a local replay returns to Player 1 private placement with two fresh human fleets", () => {
  const game = finishedGame({ mode: "human", winnerIndex: 1 });
  expect(game.advanceLevel()).toBe(false);
  const oldBoards = game.players.map(player => player.gameboard);
  expect(game.restartRound()).toBe(true);
  expect(game).toMatchObject({ phase: "handoff", pendingPhase: "placement", mode: "human",
    difficulty: null, activePlayerIndex: 0, readyPlayers: [false, false], winnerIndex: null });
  expect(game.players.map(player => player.type)).toEqual(["human", "human"]);
  game.players.forEach((player, index) => expect(player.gameboard).not.toBe(oldBoards[index]));
});
