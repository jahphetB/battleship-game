function hasShipAt(gameboard, x, y) {
	return gameboard.ships.some(({ coordinates }) =>
		coordinates.some(
			([shipX, shipY]) => shipX === x && shipY === y
		)
	);
}

function hasAttackAt(attacks, x, y) {
	return attacks.some(
		([attackX, attackY]) => attackX === x && attackY === y
	);
}

function renderBoard(gameboard, container, showShips = false) {
	container.innerHTML = "";

	for (let y = 0; y < 10; y += 1) {
		for (let x = 0; x < 10; x += 1) {
			const cell = document.createElement("button");

			cell.classList.add("board-cell");
			cell.dataset.x = x;
			cell.dataset.y = y;

			if (
				showShips &&
				hasShipAt(gameboard, x, y)
			) {
				cell.classList.add("ship");
			}

			if (
				hasAttackAt(gameboard.successfulAttacks, x, y)
			) {
				cell.classList.add("hit");
			}

			if (
				hasAttackAt(gameboard.missedAttacks, x, y)
			) {
				cell.classList.add("miss");
			}

			container.appendChild(cell);
		}
	}
}

function renderStatus(game) {
	const status = document.querySelector("#game-status");

	if (game.computerPlayer.gameboard.allShipsSunk()) {
		status.textContent = "Mission accomplished. You win!";
		return;
	}

	if (game.realPlayer.gameboard.allShipsSunk()) {
		status.textContent = "Your fleet has been destroyed. Computer wins!";
		return;
	}

	if (!game.hasBattleStarted) {
		status.textContent =
			"Fleet deployment phase: randomize your ships, then strike the enemy board.";
		return;
	}

	status.textContent =
		game.currentTurn === "real"
			? "Command ready: your turn."
			: "Enemy movement detected: computer's turn.";
}

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

    renderStatus(game);

    if (randomizeButton) {
        randomizeButton.disabled = !game.canRandomizeShips();
    }
}