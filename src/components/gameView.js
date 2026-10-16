import { renderBoard } from "./board.js";
import { renderStatus } from "./status.js";

export function renderGame(game) {
	const playerBoard = document.querySelector("#player-board");
	const computerBoard = document.querySelector("#computer-board");
	const randomizeButton = document.querySelector("#randomize-ships");

	renderBoard(
		game.realPlayer.gameboard,
		playerBoard,
		true
	);

	renderBoard(
		game.computerPlayer.gameboard,
		computerBoard,
		false
	);

	renderStatus(game, document.querySelector("#game-status"));

	if (randomizeButton) {
		randomizeButton.disabled = !game.canRandomizeShips();
	}
}
