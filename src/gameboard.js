import Ship from "./ship.js";

export default class Gameboard {
	constructor() {
		this.ships = [];
		this.missedAttacks = [];
        this.successfulAttacks = [];
	}

	placeShip(length, coordinates) {
		const isOutOfBounds = coordinates.some(
			([x, y]) => x < 0 || x > 9 || y < 0 || y > 9
		);

		if (isOutOfBounds) {
			return null;
		}

		const overlapsExistingShip = this.ships.some(({ coordinates: shipCoordinates }) =>
			shipCoordinates.some(([shipX, shipY]) =>
				coordinates.some(
					([x, y]) => x === shipX && y === shipY
				)
			)
		);

		if (overlapsExistingShip) {
			return null;
		}

		const ship = new Ship(length);

		this.ships.push({
			ship,
			coordinates,
		});

		return ship;
	}

	receiveAttack(coordinates) {
		const alreadyAttacked =
			this.successfulAttacks.some(
				([x, y]) => x === coordinates[0] && y === coordinates[1]
			) ||
			this.missedAttacks.some(
				([x, y]) => x === coordinates[0] && y === coordinates[1]
			);

		if (alreadyAttacked) {
			return;
		}

		const target = this.ships.find(({ coordinates: shipCoordinates }) =>
			shipCoordinates.some(
				([x, y]) => x === coordinates[0] && y === coordinates[1]
			)
		);

		if (target) {
			target.ship.hit();
			this.successfulAttacks.push(coordinates);
			return;
		}

		this.missedAttacks.push(coordinates);
	}

    allShipsSunk() {
        return this.ships.every(({ ship }) => ship.isSunk());
    }
}