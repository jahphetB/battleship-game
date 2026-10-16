import { renderBoard } from "./board.js";
import { renderStatus } from "./status.js";
import { renderHandoff } from "./handoffPanel.js";
import { getGameViewState } from "./gameViewState.js";
import { DIFFICULTIES } from "../game/computer/createComputerStrategy.js";

export function renderGame(game, placementControls) {
  const state = getGameViewState(game);
  const modeLabel = document.querySelector("#round-mode");
  modeLabel.hidden = !game.mode;
  modeLabel.textContent = game.mode === "computer"
    ? `Computer / Level ${DIFFICULTIES.indexOf(game.difficulty) + 1}: ${game.difficulty[0].toUpperCase()}${game.difficulty.slice(1)}`
    : "Local two-player";
  const ownBoard = document.querySelector("#player-board");
  const opponentBoard = document.querySelector("#opponent-board");
  // Clear private cells before displaying the pass-device screen.
  if (state.ownBoard) renderBoard(state.ownBoard, ownBoard, { showShips: true, interactive: game.canRandomizeShips() });
  else ownBoard.replaceChildren();
  if (state.opponentBoard) renderBoard(state.opponentBoard, opponentBoard, {
    showShips: state.revealOpponentShips, interactive: state.canAttack,
  });
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
  startButton.disabled = !game.hasReadyFleets();
  document.querySelector("#restart-round").hidden = game.phase !== "completed";
  placementControls?.render();
}

export function focusGameAction(game) {
  const selector = game.phase === "handoff" ? "#handoff-continue"
    : game.phase === "placement" ? "#randomize-ships"
    : game.phase === "battle" ? "#opponent-board button:not(:disabled)"
    : game.phase === "completed" ? "#restart-round" : "#game-status";
  document.querySelector(selector)?.focus();
}
