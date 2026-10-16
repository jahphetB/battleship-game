import Gameboard from "./gameboard.js";

test("places a ship at specific coordinates", () => {
  const gameboard = new Gameboard();

  const ship = gameboard.placeShip(2, [
    [0, 0],
    [0, 1],
  ]);

  expect(ship.length).toBe(2);
});

test("reports when all ships have been sunk", () => {
	const gameboard = new Gameboard();

	const ship1 = gameboard.placeShip(1, [[0, 0]]);
	const ship2 = gameboard.placeShip(1, [[1, 0]]);

	ship1.hit();
	ship2.hit();

	expect(gameboard.allShipsSunk()).toBe(true);
});

test("reports false when at least one ship is still afloat", () => {
	const gameboard = new Gameboard();

	gameboard.placeShip(2, [
		[0, 0],
		[0, 1],
	]);

	gameboard.receiveAttack([0, 0]);

	expect(gameboard.allShipsSunk()).toBe(false);
});

test("records the coordinates of a successful attack", () => {
	const gameboard = new Gameboard();

	gameboard.placeShip(2, [
		[0, 0],
		[0, 1],
	]);

	gameboard.receiveAttack([0, 1]);

	expect(gameboard.successfulAttacks).toContainEqual([0, 1]);
});

test("does not attack the same coordinate twice", () => {
	const gameboard = new Gameboard();

	const ship = gameboard.placeShip(2, [
		[0, 0],
		[0, 1],
	]);

	gameboard.receiveAttack([0, 0]);
	gameboard.receiveAttack([0, 0]);

	expect(ship.hits).toBe(1);
});

test("does not place a ship on top of another ship", () => {
	const gameboard = new Gameboard();

	gameboard.placeShip(2, [
		[0, 0],
		[0, 1],
	]);

	const ship = gameboard.placeShip(2, [
		[0, 1],
		[0, 2],
	]);

	expect(ship).toBeNull();
	expect(gameboard.ships.length).toBe(1);
});

test("does not place a ship outside the gameboard", () => {
	const gameboard = new Gameboard();

	const ship = gameboard.placeShip(2, [
		[9, 9],
		[10, 9],
	]);

	expect(ship).toBeNull();
	expect(gameboard.ships.length).toBe(0);
});

