import Game from "../game/game.js";
import { getGameViewState } from "./gameViewState.js";

test("setup and every handoff supply no boards to the renderer", () => {
  const game = new Game();
  expect(getGameViewState(game)).toMatchObject({ ownBoard: null, opponentBoard: null, canAttack: false });
  game.setupGame({ mode: "human" });
  for (let handoff = 0; handoff < 2; handoff += 1) {
    expect(game.phase).toBe("handoff");
    expect(getGameViewState(game)).toMatchObject({ ownBoard: null, opponentBoard: null, canAttack: false });
    game.acknowledgeHandoff();
    if (game.phase === "placement") game.confirmFleet();
  }
  expect(game.phase).toBe("battle");
  expect(getGameViewState(game).ownBoard).toBe(game.players[0].gameboard);
});

test("local placement exposes only the current player's board", () => {
  const game = new Game();
  game.setupGame({ mode: "human" });
  game.acknowledgeHandoff();
  expect(getGameViewState(game)).toMatchObject({
    ownBoard: game.players[0].gameboard, opponentBoard: null, ownTitle: "Player 1's Fleet", canAttack: false,
  });
  game.confirmFleet();
  game.acknowledgeHandoff();
  expect(getGameViewState(game)).toMatchObject({
    ownBoard: game.players[1].gameboard, opponentBoard: null, ownTitle: "Player 2's Fleet", canAttack: false,
  });
});

test("local battle perspectives alternate immediately after accepted shots", () => {
  const game = new Game();
  game.setupGame({ mode: "human" });
  game.acknowledgeHandoff();
  game.confirmFleet();
  game.acknowledgeHandoff();
  game.confirmFleet();
  game.acknowledgeHandoff();
  expect(getGameViewState(game)).toMatchObject({
    ownBoard: game.players[0].gameboard, opponentBoard: game.players[1].gameboard, canAttack: true,
  });
  game.attack([9, 9]);
  expect(game.phase).toBe("battle");
  expect(game.acknowledgeHandoff()).toBe(false);
  expect(getGameViewState(game)).toMatchObject({
    ownBoard: game.players[1].gameboard, opponentBoard: game.players[0].gameboard,
    ownTitle: "Player 2's Fleet", opponentTitle: "Player 1's Waters", canAttack: true,
  });
});

test("computer turns and defeats retain the human board perspective", () => {
  const game = new Game();
  game.setupGame();
  game.startBattle();
  game.attack([9, 9]);
  expect(game.currentPlayer.type).toBe("computer");
  expect(getGameViewState(game)).toMatchObject({
    ownBoard: game.players[0].gameboard, opponentBoard: game.players[1].gameboard, canAttack: false,
  });
  const cells = game.players[0].gameboard.ships.flatMap(entry => entry.coordinates);
  const last = cells.pop();
  cells.forEach(coordinate => game.players[0].gameboard.receiveAttack(coordinate));
  game.computerStrategy = { nextAttack: () => last, recordResult: jest.fn() };
  game.computerAttack();
  expect(game.winnerIndex).toBe(1);
  expect(getGameViewState(game)).toMatchObject({
    ownBoard: game.players[0].gameboard, opponentBoard: game.players[1].gameboard,
    opponentTitle: "Computer Fleet Revealed", revealOpponentShips: true, canAttack: false,
  });
});

test.each([0, 1])("local completion shows winner %s's fleet to the loser", winnerIndex => {
  const game = new Game();
  game.setupGame({ mode: "human" });
  game.acknowledgeHandoff();
  game.confirmFleet();
  game.acknowledgeHandoff();
  game.confirmFleet();
  if (winnerIndex === 1) game.attack([9, 9]);
  const defender = game.opponent.gameboard;
  const cells = defender.ships.flatMap(ship => ship.coordinates);
  const last = cells.pop();
  cells.forEach(cell => defender.receiveAttack(cell));
  game.attack(last);
  expect(getGameViewState(game)).toMatchObject({
    ownBoard: game.players[1 - winnerIndex].gameboard,
    opponentBoard: game.players[winnerIndex].gameboard,
    ownTitle: `Player ${2 - winnerIndex}'s Fleet`,
    opponentTitle: `Player ${winnerIndex + 1}'s Fleet`,
    revealOpponentShips: true, canAttack: false,
  });
});
