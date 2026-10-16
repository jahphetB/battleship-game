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

export function renderBoard(gameboard, container, showShips = false) {
	container.innerHTML = "";

	const corner = document.createElement("span");
	corner.classList.add("coordinate-label", "coordinate-corner");
	container.appendChild(corner);

	for (let x = 0; x < 10; x += 1) {
		const label = document.createElement("span");

		label.classList.add("coordinate-label");
		label.textContent = String.fromCharCode(65 + x);

		container.appendChild(label);
	}

	for (let y = 0; y < 10; y += 1) {
		const rowLabel = document.createElement("span");

		rowLabel.classList.add("coordinate-label");
		rowLabel.textContent = y + 1;

		container.appendChild(rowLabel);

		for (let x = 0; x < 10; x += 1) {
			const cell = document.createElement("button");

			cell.classList.add("board-cell");
			cell.dataset.x = x;
			cell.dataset.y = y;
			cell.setAttribute(
				"aria-label",
				`${String.fromCharCode(65 + x)}${y + 1}`
			);

			if (
				showShips &&
				hasShipAt(gameboard, x, y)
			) {
				cell.classList.add("ship");
			}

			if (
				hasAttackAt(
					gameboard.successfulAttacks,
					x,
					y
				)
			) {
				cell.classList.add("hit");
			}

			if (
				hasAttackAt(
					gameboard.missedAttacks,
					x,
					y
				)
			) {
				cell.classList.add("miss");
			}

			container.appendChild(cell);
		}
	}
}

