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
  expect(game.players[0].type).toBe("human");
  expect(game.players[1].type).toBe("computer");
  expect(game.players[0].gameboard).not.toBe(game.players[1].gameboard);
  expect(game.attack([0, 0])).toEqual({ accepted: false });
  expect(game.startBattle()).toBe(false);
  expect(game.randomizePlayerShips()).toBe(false);
});

test("unsupported modes leave setup untouched; a valid choice enters placement", () => {
  const game = new Game();
  expect(game.setupGame({ mode: "unknown" })).toBe(false);
  expect(game.phase).toBe("setup");
  expect(game.mode).toBeNull();
  expect(game.players[0].gameboard.ships).toEqual([]);
  expect(game.players[1].gameboard.ships).toEqual([]);
  expect(game.setupGame({ mode: "computer" })).toBe(true);
  expect(game.mode).toBe("computer");
  expect(game.phase).toBe("placement");
  expect(game.setupGame({ mode: "unknown" })).toBe(false);
  expect(game.mode).toBe("computer");
});

test("setup gives both players full randomized fleets and requires explicit start", () => {
  const game = new Game();
  expect(game.setupGame()).toBe(true);
  expect(game.phase).toBe("placement");
  for (const player of [game.players[0], game.players[1]]) expect(player.gameboard.ships).toHaveLength(5);
  expect(game.attack([0, 0]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(false);
  expect(game.setupGame()).toBe(false);
  expect(game.startBattle()).toBe(true);
  expect(game.phase).toBe("battle");
  expect(game.activePlayerIndex).toBe(0);
});

test.each([0, 1])("can randomize participant %s during placement only", playerIndex => {
  const game = new Game();
  game.setupGame();
  const player = game.players[playerIndex];
  const original = player.gameboard;
  expect(game.randomizePlayerShips(playerIndex)).toBe(true);
  expect(player.gameboard).not.toBe(original);
  expect(player.gameboard.ships).toHaveLength(5);
  game.startBattle();
  const ready = player.gameboard;
  expect(game.randomizePlayerShips(playerIndex)).toBe(false);
  expect(player.gameboard).toBe(ready);
});

test("rejects an unknown player and an incomplete or incorrect fleet", () => {
  const game = new Game();
  game.setupGame();
  expect(game.randomizePlayerShips("other")).toBe(false);
  game.players[0].gameboard.ships.pop();
  expect(game.startBattle()).toBe(false);
  game.players[0].gameboard.placeShip(1, [[9, 9]]);
  expect(game.startBattle()).toBe(false);
  expect(game.phase).toBe("placement");
});

test("accepted attacks alternate turns; invalid and repeated shots do not", () => {
  const game = readyGame();
  expect(game.attack([10, 0]).accepted).toBe(false);
  expect(game.activePlayerIndex).toBe(0);
  expect(game.attack([9, 9]).accepted).toBe(true);
  expect(game.activePlayerIndex).toBe(1);
  expect(game.attack([8, 9]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(true);
  expect(game.activePlayerIndex).toBe(0);
  expect(game.attack([9, 9]).accepted).toBe(false);
  expect(game.activePlayerIndex).toBe(0);
  expect(game.computerAttack().accepted).toBe(false);
  expect(game.players[1].gameboard.missedAttacks).toEqual([[9, 9]]);
});

test("duplicate hits do not damage ships or consume the turn", () => {
  const game = readyGame();
  game.attack([0, 0]);
  game.computerAttack();
  expect(game.attack([0, 0]).accepted).toBe(false);
  expect(game.activePlayerIndex).toBe(0);
  expect(game.players[1].gameboard.ships[0].ship.hits).toBe(1);
});

test("computer follows an adjacent hit without repeating shots", () => {
  const game = readyGame();
  game.attack([9, 9]);
  game.computerAttack();
  game.attack([8, 9]);
  game.computerAttack();
  expect(game.players[0].gameboard.successfulAttacks).toEqual([[0, 0], [1, 0]]);
});

test.each(["real", "computer"])("final %s hit completes the round and blocks every further action", winner => {
  const game = readyGame();
  const board = winner === "real" ? game.players[1].gameboard : game.players[0].gameboard;
  const cells = board.ships.flatMap(entry => entry.coordinates);
  const last = cells.pop();
  cells.forEach(cell => board.receiveAttack(cell));
  if (winner === "real") {
    expect(game.attack(last).accepted).toBe(true);
  } else {
    game.activePlayerIndex = 1;
    game.computerTargets = [last];
    expect(game.computerAttack().accepted).toBe(true);
  }
  expect(game.phase).toBe("completed");
  expect(game.winnerIndex).toBe(winner === "real" ? 0 : 1);
  expect(game.isGameOver()).toBe(true);
  expect(game.attack([9, 9]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(false);
  expect(game.randomizePlayerShips()).toBe(false);
  expect(game.startBattle()).toBe(false);
  expect(game.setupGame()).toBe(false);
});
