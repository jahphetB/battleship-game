export function renderStatus(game, status) {
	if (game.computerPlayer.gameboard.allShipsSunk()) {
		status.textContent =
			"VICTORY — Enemy fleet destroyed.";
		status.dataset.state = "victory";
		return;
	}

	if (game.realPlayer.gameboard.allShipsSunk()) {
		status.textContent =
			"DEFEAT — Your fleet has been destroyed.";
		status.dataset.state = "defeat";
		return;
	}

	if (!game.hasBattleStarted) {
		status.textContent =
			"DEPLOYMENT — Position your fleet before engaging. Start attacking once you're ready.";
		status.dataset.state = "deployment";
		return;
	}

	if (game.currentTurn === "real") {
		status.textContent =
			"YOUR TURN — Select a target in enemy waters.";
		status.dataset.state = "player";
		return;
	}

	status.textContent =
		"ENEMY TURN — Incoming fire.";
	status.dataset.state = "computer";
}

