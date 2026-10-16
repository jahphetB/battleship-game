import { renderStatus } from "./status.js";

test.each([
  [{ phase: "setup" }, "setup", /choose your mission/i],
  [{ phase: "placement" }, "deployment", /start battle/i],
  [{ phase: "battle", currentPlayer: { type: "human" } }, "player", /select a target/i],
  [{ phase: "battle", currentPlayer: { type: "computer" } }, "computer", /incoming fire/i],
  [{ phase: "completed", winnerIndex: 0 }, "victory", /enemy fleet destroyed/i],
  [{ phase: "completed", winnerIndex: 1 }, "defeat", /your fleet has been destroyed/i],
  [{ phase: "handoff", currentPlayer: { name: "Player 2" } }, "handoff", /pass the device to player 2/i],
  [{ phase: "placement", mode: "human", currentPlayer: { name: "Player 2" } }, "deployment", /player 2.*confirm fleet/i],
  [{ phase: "battle", mode: "human", currentPlayer: { type: "human", name: "Player 2" } }, "player", /player 2's turn/i],
  [{ phase: "completed", mode: "human", winner: { name: "Player 2" }, winnerIndex: 1 }, "victory", /player 2 wins/i],
])("renders the correct instruction for round state %#", (game, expectedState, message) => {
  const status = { textContent: "", dataset: {} };
  renderStatus(game, status);
  expect(status.dataset.state).toBe(expectedState);
  expect(status.textContent).toMatch(message);
});
