import Game from "./game/game.js";
import { renderGame, focusGameAction } from "./components/gameView.js";
import WelcomeDialog from "./components/welcomeDialog.js";
import "./styles/global.css";
import "./styles/commandPanel.css";
import "./styles/board.css";
import "./styles/dialogs.css";
import "./styles/handoffPanel.css";

const game = new Game();
renderGame(game);

const welcome = new WelcomeDialog(document.querySelector("#welcome-dialog"), {
  onConfirm: options => {
    if (!game.setupGame(options)) return false;
    renderGame(game);
    return true;
  },
  focusAfterClose: () => focusGameAction(game),
});
welcome.open();

const opponentBoard = document.querySelector("#opponent-board");
opponentBoard.addEventListener("click", event => {
  const cell = event.target.closest(".board-cell");
  if (!cell || !opponentBoard.contains(cell)) return;
  const outcome = game.attack([Number(cell.dataset.x), Number(cell.dataset.y)]);
  if (!outcome.accepted) return;
  if (game.mode === "computer") game.computerAttack();
  renderGame(game);
  focusGameAction(game);
});

document.querySelector("#randomize-ships").addEventListener("click", () => {
  if (game.randomizePlayerShips()) renderGame(game);
});

document.querySelector("#start-battle").addEventListener("click", () => {
  const accepted = game.mode === "human" ? game.confirmFleet() : game.startBattle();
  if (accepted) {
    renderGame(game);
    focusGameAction(game);
  }
});

document.querySelector("#handoff-continue").addEventListener("click", () => {
  if (game.acknowledgeHandoff()) {
    renderGame(game);
    focusGameAction(game);
  }
});
