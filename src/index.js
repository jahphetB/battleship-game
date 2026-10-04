import Game from "./game.js";
import { renderGame } from "./dom.js";
import "./styles.css";

const game = new Game();

game.setupGame();
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
	game.randomizePlayerShips();
	renderGame(game);
});