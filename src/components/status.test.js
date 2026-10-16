import { renderStatus } from "./status.js";

test.each([
  [{ phase: "setup" }, "setup", /choose your mission/i],
  [{ phase: "placement" }, "deployment", /start battle/i],
  [{ phase: "battle", currentPlayer: { type: "human" } }, "player", /select a target/i],
  [{ phase: "battle", currentPlayer: { type: "computer" } }, "computer", /incoming fire/i],
  [{ phase: "completed", winnerIndex: 0 }, "victory", /enemy fleet destroyed/i],
  [{ phase: "completed", winnerIndex: 1 }, "defeat", /your fleet has been destroyed/i],
])("renders the correct instruction for round state %#", (game, expectedState, message) => {
  const status = { textContent: "", dataset: {} };
  renderStatus(game, status);
  expect(status.dataset.state).toBe(expectedState);
  expect(status.textContent).toMatch(message);
});
