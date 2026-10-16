import Game from "./game/game.js";
import { renderGame } from "./components/gameView.js";
import "./styles/global.css";
import "./styles/commandPanel.css";
import "./styles/board.css";

const game = new Game();

game.setupGame();
game.randomizePlayerShips();
renderGame(game);

const computerBoard = document.querySelector("#computer-board");

computerBoard.addEventListener("click", (event) => {
	const cell = event.target.closest(".board-cell");

	if (!cell || game.currentTurn !== "real" || game.isGameOver()) {
		return;
	}

	const x = Number(cell.dataset.x);
	const y = Number(cell.dataset.y);

	game.attack([x, y]);
	renderGame(game);

	if (game.isGameOver()) {
		return;
	}

	game.computerAttack();
	renderGame(game);
});

const randomizeButton = document.querySelector("#randomize-ships");

randomizeButton.addEventListener("click", () => {
	if (!game.canRandomizeShips()) {
		return;
	}

	game.randomizePlayerShips();
	renderGame(game);
});