import Game from "./game.js";
import FleetPlacement from "./fleetPlacement.js";

function localGame() {
  const game = new Game({ fleetPlacement: new FleetPlacement(() => 0) });
  game.setupGame({ mode: "human" });
  return game;
}

function readyLocalGame() {
  const game = localGame();
  game.acknowledgeHandoff();
  game.confirmFleet();
  game.acknowledgeHandoff();
  game.confirmFleet();
  game.acknowledgeHandoff();
  return game;
}

test("local mode creates two named human players and protects the first setup", () => {
  const game = localGame();
  expect(game.players.map(player => [player.type, player.name])).toEqual([
    ["human", "Player 1"], ["human", "Player 2"],
  ]);
  expect(game.phase).toBe("handoff");
  expect(game.pendingPhase).toBe("placement");
  expect(game.activePlayerIndex).toBe(0);
  expect(game.randomizePlayerShips()).toBe(false);
  expect(game.confirmFleet()).toBe(false);
  expect(game.startBattle()).toBe(false);
  expect(game.attack([0, 0]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(false);
});

test("each player confirms privately before Player 1 can start firing", () => {
  const game = localGame();
  expect(game.acknowledgeHandoff()).toBe(true);
  expect(game.acknowledgeHandoff()).toBe(false);
  expect(game.randomizePlayerShips(1)).toBe(false);
  expect(game.randomizePlayerShips()).toBe(true);
  const firstFleet = game.currentPlayer.gameboard;
  expect(game.confirmFleet()).toBe(true);
  expect(game.phase).toBe("handoff");
  expect(game.readyPlayers).toEqual([true, false]);
  expect(game.confirmFleet()).toBe(false);
  expect(game.randomizePlayerShips(0)).toBe(false);
  game.acknowledgeHandoff();
  expect(game.currentPlayer.name).toBe("Player 2");
  expect(game.phase).toBe("placement");
  expect(game.randomizePlayerShips(0)).toBe(false);
  expect(game.randomizePlayerShips()).toBe(true);
  expect(game.players[0].gameboard).toBe(firstFleet);
  expect(game.startBattle()).toBe(false);
  expect(game.confirmFleet()).toBe(true);
  expect(game.readyPlayers).toEqual([true, true]);
  expect(game.phase).toBe("handoff");
  expect(game.pendingPhase).toBe("battle");
  expect(game.attack([0, 0]).accepted).toBe(false);
  game.acknowledgeHandoff();
  expect(game.phase).toBe("battle");
  expect(game.currentPlayer.name).toBe("Player 1");
  expect(game.randomizePlayerShips()).toBe(false);
});

test.each([0, 1])("player %s cannot confirm an incomplete fleet", index => {
  const game = localGame();
  game.acknowledgeHandoff();
  if (index === 1) {
    game.confirmFleet();
    game.acknowledgeHandoff();
  }
  game.currentPlayer.gameboard.ships.pop();
  expect(game.confirmFleet()).toBe(false);
  expect(game.phase).toBe("placement");
  expect(game.readyPlayers[index]).toBe(false);
});

test("each accepted local shot requires a handoff and never triggers computer fire", () => {
  const game = readyLocalGame();
  expect(game.attack([9, 9]).accepted).toBe(true);
  expect(game.phase).toBe("handoff");
  expect(game.currentPlayer.name).toBe("Player 2");
  expect(game.players[1].gameboard.missedAttacks).toEqual([[9, 9]]);
  expect(game.lastShot).toEqual({ playerIndex: 0, coordinates: [9, 9], hit: false, sunk: false });
  expect(game.players[0].gameboard.missedAttacks).toEqual([]);
  expect(game.attack([8, 9]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(false);
  expect(game.confirmFleet()).toBe(false);
  expect(game.randomizePlayerShips()).toBe(false);
  game.acknowledgeHandoff();
  expect(game.attack([9, 9]).accepted).toBe(true);
  expect(game.players[0].gameboard.missedAttacks).toEqual([[9, 9]]);
  expect(game.phase).toBe("handoff");
  expect(game.activePlayerIndex).toBe(0);
  expect(game.lastShot.playerIndex).toBe(1);
});

test("repeated or invalid local shots preserve the active player and battle phase", () => {
  const game = readyLocalGame();
  game.attack([0, 0]);
  game.acknowledgeHandoff();
  game.attack([9, 9]);
  game.acknowledgeHandoff();
  expect(game.attack([0, 0]).accepted).toBe(false);
  expect(game.attack([10, 0]).accepted).toBe(false);
  expect(game.phase).toBe("battle");
  expect(game.activePlayerIndex).toBe(0);
  expect(game.players[1].gameboard.ships[0].ship.hits).toBe(1);
});

test.each([0, 1])("either local participant can win (%s), with no final handoff", winnerIndex => {
  const game = readyLocalGame();
  if (winnerIndex === 1) {
    game.attack([9, 9]);
    game.acknowledgeHandoff();
  }
  const defender = game.opponent.gameboard;
  const coordinates = defender.ships.flatMap(entry => entry.coordinates);
  const last = coordinates.pop();
  coordinates.forEach(coordinate => defender.receiveAttack(coordinate));
  expect(game.attack(last).accepted).toBe(true);
  expect(game.phase).toBe("completed");
  expect(game.winner).toBe(game.players[winnerIndex]);
  expect(game.winner.name).toBe(`Player ${winnerIndex + 1}`);
  expect(game.pendingPhase).toBeNull();
  expect(game.acknowledgeHandoff()).toBe(false);
  expect(game.attack([9, 8]).accepted).toBe(false);
  expect(game.computerAttack().accepted).toBe(false);
  expect(game.confirmFleet()).toBe(false);
});
