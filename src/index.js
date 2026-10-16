import Game from "./game/game.js";
import { renderGame, focusGameAction } from "./components/gameView.js";
import WelcomeDialog from "./components/welcomeDialog.js";
import PlacementControls from "./components/placementControls.js";
import ResultDialog from "./components/resultDialog.js";
import "./styles/global.css";
import "./styles/commandPanel.css";
import "./styles/board.css";
import "./styles/dialogs.css";
import "./styles/handoffPanel.css";
import "./styles/placementControls.css";

const game = new Game();
const placementControls = new PlacementControls({
  game,
  panel: document.querySelector("#placement-controls"),
  board: document.querySelector("#player-board"),
  onChange: () => renderGame(game, placementControls),
});
renderGame(game, placementControls);

const welcome = new WelcomeDialog(document.querySelector("#welcome-dialog"), {
  onConfirm: options => {
    if (!game.setupGame(options)) return false;
    renderGame(game, placementControls);
    return true;
  },
  focusAfterClose: () => focusGameAction(game),
});
welcome.open();

const resultDialog = new ResultDialog(document.querySelector("#result-dialog"), {
  onNextLevel: () => {
    if (!game.advanceLevel()) return false;
    renderGame(game, placementControls);
    return true;
  },
  focusAfterClose: () => focusGameAction(game),
});

const opponentBoard = document.querySelector("#opponent-board");
opponentBoard.addEventListener("click", event => {
  const cell = event.target.closest(".board-cell");
  if (!cell || !opponentBoard.contains(cell)) return;
  const outcome = game.attack([Number(cell.dataset.x), Number(cell.dataset.y)]);
  if (!outcome.accepted) return;
  if (game.mode === "computer") game.computerAttack();
  renderGame(game, placementControls);
  if (game.isGameOver()) resultDialog.open(game);
  else focusGameAction(game);
});

document.querySelector("#restart-round").addEventListener("click", () => {
  if (!game.restartRound()) return;
  renderGame(game, placementControls);
  focusGameAction(game);
});

document.querySelector("#randomize-ships").addEventListener("click", () => {
  if (game.randomizePlayerShips()) renderGame(game, placementControls);
});

document.querySelector("#start-battle").addEventListener("click", () => {
  const accepted = game.mode === "human" ? game.confirmFleet() : game.startBattle();
  if (accepted) {
    renderGame(game, placementControls);
    focusGameAction(game);
  }
});

document.querySelector("#handoff-continue").addEventListener("click", () => {
  if (game.acknowledgeHandoff()) {
    renderGame(game, placementControls);
    focusGameAction(game);
  }
});
