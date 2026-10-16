import Game from "./game.js";
import FleetPlacement from "./fleetPlacement.js";

function readyGame() {
  const game = new Game({ fleetPlacement: new FleetPlacement(() => 0), random: () => 0 });
  game.setupGame();
  game.startBattle();
  return game;
}

test("starts in setup with independent human and computer participants", () => {
  const game = new Game();
  expect(game.phase).toBe("setup");
  expect(game.realPlayer.type).toBe("real");
  expect(game.computerPlayer.type).toBe("computer");
  expect(game.realPlayer.gameboard).not.toBe(game.computerPlayer.gameboard);
  expect(game.attack([0, 0])).toEqual({ accepted: false });
  expect(game.startBattle()).toBe(false);
  expect(game.randomizePlayerShips()).toBe(false);
});

test("setup gives both players full randomized fleets and requires explicit start", () => {
  const game = new Game();
  expect(game.setupGame()).toBe(true);
  expect(game.phase).toBe("placement");
  for (const player of [game.realPlayer, game.computerPlayer]) expect(player.gameboard.ships).toHaveLength(5);
  expect(game.attack([0, 0]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(false);
  expect(game.setupGame()).toBe(false);
  expect(game.startBattle()).toBe(true);
  expect(game.phase).toBe("battle");
  expect(game.currentTurn).toBe("real");
});

test.each(["real", "computer"])("can randomize %s during placement only", type => {
  const game = new Game();
  game.setupGame();
  const player = type === "real" ? game.realPlayer : game.computerPlayer;
  const original = player.gameboard;
  expect(game.randomizePlayerShips(type)).toBe(true);
  expect(player.gameboard).not.toBe(original);
  expect(player.gameboard.ships).toHaveLength(5);
  game.startBattle();
  const ready = player.gameboard;
  expect(game.randomizePlayerShips(type)).toBe(false);
  expect(player.gameboard).toBe(ready);
});

test("rejects an unknown player and an incomplete or incorrect fleet", () => {
  const game = new Game();
  game.setupGame();
  expect(game.randomizePlayerShips("other")).toBe(false);
  game.realPlayer.gameboard.ships.pop();
  expect(game.startBattle()).toBe(false);
  game.realPlayer.gameboard.placeShip(1, [[9, 9]]);
  expect(game.startBattle()).toBe(false);
  expect(game.phase).toBe("placement");
});

test("accepted attacks alternate turns; invalid and repeated shots do not", () => {
  const game = readyGame();
  expect(game.attack([10, 0]).accepted).toBe(false);
  expect(game.currentTurn).toBe("real");
  expect(game.attack([9, 9]).accepted).toBe(true);
  expect(game.currentTurn).toBe("computer");
  expect(game.attack([8, 9]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(true);
  expect(game.currentTurn).toBe("real");
  expect(game.attack([9, 9]).accepted).toBe(false);
  expect(game.currentTurn).toBe("real");
  expect(game.computerAttack().accepted).toBe(false);
  expect(game.computerPlayer.gameboard.missedAttacks).toEqual([[9, 9]]);
});

test("duplicate hits do not damage ships or consume the turn", () => {
  const game = readyGame();
  game.attack([0, 0]);
  game.computerAttack();
  expect(game.attack([0, 0]).accepted).toBe(false);
  expect(game.currentTurn).toBe("real");
  expect(game.computerPlayer.gameboard.ships[0].ship.hits).toBe(1);
});

test("computer follows an adjacent hit without repeating shots", () => {
  const game = readyGame();
  game.attack([9, 9]);
  game.computerAttack();
  game.attack([8, 9]);
  game.computerAttack();
  expect(game.realPlayer.gameboard.successfulAttacks).toEqual([[0, 0], [1, 0]]);
});

test.each(["real", "computer"])("final %s hit completes the round and blocks every further action", winner => {
  const game = readyGame();
  const board = winner === "real" ? game.computerPlayer.gameboard : game.realPlayer.gameboard;
  const cells = board.ships.flatMap(entry => entry.coordinates);
  const last = cells.pop();
  cells.forEach(cell => board.receiveAttack(cell));
  if (winner === "real") {
    expect(game.attack(last).accepted).toBe(true);
  } else {
    game.currentTurn = "computer";
    game.computerTargets = [last];
    expect(game.computerAttack().accepted).toBe(true);
  }
  expect(game.phase).toBe("completed");
  expect(game.winner).toBe(winner);
  expect(game.isGameOver()).toBe(true);
  expect(game.attack([9, 9]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(false);
  expect(game.randomizePlayerShips()).toBe(false);
  expect(game.startBattle()).toBe(false);
  expect(game.setupGame()).toBe(false);
});
