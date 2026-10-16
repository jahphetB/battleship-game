import Game from "../game/game.js";
import { getGameViewState } from "./gameViewState.js";

test("setup and every handoff supply no boards to the renderer", () => {
  const game = new Game();
  expect(getGameViewState(game)).toMatchObject({ ownBoard: null, opponentBoard: null, canAttack: false });
  game.setupGame({ mode: "human" });
  for (let handoff = 0; handoff < 3; handoff += 1) {
    expect(game.phase).toBe("handoff");
    expect(getGameViewState(game)).toMatchObject({ ownBoard: null, opponentBoard: null, canAttack: false });
    game.acknowledgeHandoff();
    if (game.phase === "placement") game.confirmFleet();
  }
  game.attack([9, 9]);
  expect(getGameViewState(game)).toMatchObject({ ownBoard: null, opponentBoard: null, canAttack: false });
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

test("local battle perspectives alternate only after handoff acknowledgement", () => {
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
  expect(getGameViewState(game).ownBoard).toBeNull();
  game.acknowledgeHandoff();
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
  game.computerTargets = [last];
  game.computerAttack();
  expect(game.winnerIndex).toBe(1);
  expect(getGameViewState(game).ownBoard).toBe(game.players[0].gameboard);
});
