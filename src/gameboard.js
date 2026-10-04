import Ship from "./ship.js";

export default class Gameboard {
	constructor() {
		this.ships = [];
		this.missedAttacks = [];
        this.successfulAttacks = [];
	}

	placeShip(length, coordinates) {
		const ship = new Ship(length);

		this.ships.push({
			ship,
			coordinates,
		});

		return ship;
	}

	receiveAttack(coordinates) {
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