import Game from "./game/game.js";
import { renderGame } from "./components/gameView.js";
import "./styles/global.css";
import "./styles/commandPanel.css";
import "./styles/board.css";

const game = new Game();
game.setupGame();
renderGame(game);

const computerBoard = document.querySelector("#computer-board");
computerBoard.addEventListener("click", event => {
  const cell = event.target.closest(".board-cell");
  if (!cell || !computerBoard.contains(cell)) return;
  const outcome = game.attack([Number(cell.dataset.x), Number(cell.dataset.y)]);
  if (!outcome.accepted) return;
  game.computerAttack();
  renderGame(game);
});

document.querySelector("#randomize-ships").addEventListener("click", () => {
  if (game.randomizePlayerShips()) renderGame(game);
});

document.querySelector("#start-battle").addEventListener("click", () => {
  if (game.startBattle()) renderGame(game);
});
