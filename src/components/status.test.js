import { renderStatus } from "./status.js";

test.each([
  [{ phase: "setup" }, "setup", /choose your mission/i],
  [{ phase: "placement" }, "deployment", /start battle/i],
  [{ phase: "battle", currentTurn: "real" }, "player", /select a target/i],
  [{ phase: "battle", currentTurn: "computer" }, "computer", /incoming fire/i],
  [{ phase: "completed", winner: "real" }, "victory", /enemy fleet destroyed/i],
  [{ phase: "completed", winner: "computer" }, "defeat", /your fleet has been destroyed/i],
])("renders the correct instruction for round state %#", (game, expectedState, message) => {
  const status = { textContent: "", dataset: {} };
  renderStatus(game, status);
  expect(status.dataset.state).toBe(expectedState);
  expect(status.textContent).toMatch(message);
});
