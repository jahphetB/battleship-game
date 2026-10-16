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



test.each([
  [3, [[0, 0], [1, 0]]],
  [2, [[0, 0], [1, 1]]],
  [2, [[0, 0], [2, 0]]],
  [2, [[0, 0], [0, 0]]],
  [1, [[0.5, 0]]],
  [1, [["0", 0]]],
  [0, []],
  [11, []],
  [2, null],
  [1, [[0]]],
])("rejects invalid placement %# without changing the board", (length, coordinates) => {
  const board = new Gameboard();
  expect(board.placeShip(length, coordinates)).toBeNull();
  expect(board.ships).toHaveLength(0);
});

test("accepts contiguous coordinates in reverse order", () => {
  expect(new Gameboard().placeShip(3, [[2, 9], [1, 9], [0, 9]])).not.toBeNull();
});

test.each([[-1, 0], [10, 0], [0, 1.5], [NaN, 0], ["0", 0], null, [0]].map(coordinate => [coordinate]))(
  "rejects malformed or out-of-bounds attacks %#", coordinate => {
    const board = new Gameboard();
    expect(board.receiveAttack(coordinate)).toEqual({ accepted: false });
    expect(board.missedAttacks).toEqual([]);
  }
);

test("returns an explicit outcome and rejects duplicate misses", () => {
  const board = new Gameboard();
  expect(board.receiveAttack([9, 9])).toEqual({ accepted: true, hit: false, sunk: false });
  expect(board.receiveAttack([9, 9])).toEqual({ accepted: false });
  expect(board.missedAttacks).toHaveLength(1);
});

test("returns hit and sunk outcomes without double counting", () => {
  const board = new Gameboard();
  const ship = board.placeShip(2, [[0, 0], [1, 0]]);
  expect(board.receiveAttack([0, 0])).toEqual({ accepted: true, hit: true, sunk: false });
  expect(board.receiveAttack([1, 0])).toEqual({ accepted: true, hit: true, sunk: true });
  expect(board.receiveAttack([0, 0])).toEqual({ accepted: false });
  expect(ship.hits).toBe(2);
});

test("an empty board is not a defeated fleet", () => {
  expect(new Gameboard().allShipsSunk()).toBe(false);
});

test("placement and attack records do not retain caller coordinate arrays", () => {
  const board = new Gameboard();
  const placement = [[0, 0]];
  const attack = [0, 0];
  board.placeShip(1, placement);
  board.receiveAttack(attack);
  placement[0][0] = 9;
  attack[0] = 9;
  expect(board.ships[0].coordinates).toEqual([[0, 0]]);
  expect(board.successfulAttacks).toEqual([[0, 0]]);
});
