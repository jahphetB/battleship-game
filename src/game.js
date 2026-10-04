import Player from "./player.js";

export default class Game {
	constructor() {
		this.realPlayer = new Player("real");
		this.computerPlayer = new Player("computer");
		this.currentTurn = "real";
        this.computerAttacks = new Set();
        this.hasBattleStarted = false;
	}

    canRandomizeShips() {
        return !this.hasBattleStarted;
    }

	attack(coordinates) {
        if (this.currentTurn !== "real" || this.isGameOver()) {
            return;
        }

        this.hasBattleStarted = true;
        this.computerPlayer.gameboard.receiveAttack(coordinates);
        this.currentTurn = "computer";
    }

    computerAttack() {
        if (this.currentTurn !== "computer" || this.isGameOver()) {
            return;
        }

        this.hasBattleStarted = true;

        let coordinates;
        let key;

        do {
            const x = Math.floor(Math.random() * 10);
            const y = Math.floor(Math.random() * 10);

            coordinates = [x, y];
            key = `${x},${y}`;
        } while (this.computerAttacks.has(key));

        this.computerAttacks.add(key);
        this.realPlayer.gameboard.receiveAttack(coordinates);
        this.currentTurn = "real";
    }

    isGameOver() {
        const realPlayerLost =
            this.realPlayer.gameboard.ships.length > 0 &&
            this.realPlayer.gameboard.allShipsSunk();

        const computerPlayerLost =
            this.computerPlayer.gameboard.ships.length > 0 &&
            this.computerPlayer.gameboard.allShipsSunk();

        return realPlayerLost || computerPlayerLost;
    }

    setupGame() {
        this.realPlayer.gameboard.placeShip(5, [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
        ]);

        this.realPlayer.gameboard.placeShip(4, [
            [2, 0],
            [2, 1],
            [2, 2],
            [2, 3],
        ]);

        this.realPlayer.gameboard.placeShip(3, [
            [4, 0],
            [4, 1],
            [4, 2],
        ]);

        this.realPlayer.gameboard.placeShip(3, [
            [6, 0],
            [6, 1],
            [6, 2],
        ]);

        this.realPlayer.gameboard.placeShip(2, [
            [8, 0],
            [8, 1],
        ]);

        this.computerPlayer.gameboard.placeShip(5, [
            [0, 5],
            [0, 6],
            [0, 7],
            [0, 8],
            [0, 9],
        ]);

        this.computerPlayer.gameboard.placeShip(4, [
            [2, 6],
            [3, 6],
            [4, 6],
            [5, 6],
        ]);

        this.computerPlayer.gameboard.placeShip(3, [
            [4, 8],
            [5, 8],
            [6, 8],
        ]);

        this.computerPlayer.gameboard.placeShip(3, [
            [7, 2],
            [7, 3],
            [7, 4],
        ]);

        this.computerPlayer.gameboard.placeShip(2, [
            [9, 8],
            [9, 9],
        ]);
    }

    randomizePlayerShips() {
        if (!this.canRandomizeShips()) {
            return;
        }

        const fleet = [5, 4, 3, 3, 2];

        this.realPlayer.gameboard.ships = [];

        fleet.forEach((length) => {
            let placedShip = null;

            while (!placedShip) {
                const isHorizontal = Math.random() < 0.5;

                const startX = isHorizontal
                    ? Math.floor(Math.random() * (11 - length))
                    : Math.floor(Math.random() * 10);

                const startY = isHorizontal
                    ? Math.floor(Math.random() * 10)
                    : Math.floor(Math.random() * (11 - length));

                const coordinates = [];

                for (let i = 0; i < length; i += 1) {
                    coordinates.push([
                        isHorizontal ? startX + i : startX,
                        isHorizontal ? startY : startY + i,
                    ]);
                }

                placedShip = this.realPlayer.gameboard.placeShip(
                    length,
                    coordinates
                );
            }
        });
    }
}