import { renderBoard } from "./board.js";
import { renderStatus } from "./status.js";
import { renderHandoff } from "./handoffPanel.js";
import { getGameViewState } from "./gameViewState.js";

export function renderGame(game) {
  const state = getGameViewState(game);
  const ownBoard = document.querySelector("#player-board");
  const opponentBoard = document.querySelector("#opponent-board");
  // Clear private cells before displaying the pass-device screen.
  if (state.ownBoard) renderBoard(state.ownBoard, ownBoard, { showShips: true });
  else ownBoard.replaceChildren();
  if (state.opponentBoard) renderBoard(state.opponentBoard, opponentBoard, { interactive: state.canAttack });
  else opponentBoard.replaceChildren();
  document.querySelector("#boards").hidden = !state.ownBoard;
  document.querySelector("#opponent-section").hidden = !state.opponentBoard;
  document.querySelector("#own-fleet-title").textContent = state.ownTitle;
  document.querySelector("#opponent-waters-title").textContent = state.opponentTitle;
  ownBoard.setAttribute("aria-label", state.ownTitle);
  opponentBoard.setAttribute("aria-label", state.opponentTitle);
  document.querySelector("#command-panel").hidden = ["setup", "handoff"].includes(game.phase);
  renderStatus(game, document.querySelector("#game-status"));
  renderHandoff(game, document.querySelector("#handoff-panel"));
  document.querySelector("#randomize-ships").disabled = !game.canRandomizeShips();
  const startButton = document.querySelector("#start-battle");
  startButton.hidden = game.phase !== "placement";
  startButton.textContent = game.mode === "human" ? "Confirm Fleet" : "Start Battle";
}

export function focusGameAction(game) {
  const selector = game.phase === "handoff" ? "#handoff-continue"
    : game.phase === "placement" ? "#randomize-ships"
    : game.phase === "battle" ? "#opponent-board button:not(:disabled)"
    : "#game-status";
  document.querySelector(selector)?.focus();
}
