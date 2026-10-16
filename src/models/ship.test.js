import Ship from "./ship.js";

test("creates a ship with the given length", () => {
  const ship = new Ship(3);

  expect(ship.length).toBe(3);
});

test("hit increases the number of hits by 1", () => {
  const ship = new Ship(3);

  ship.hit();

  expect(ship.hits).toBe(1);
});

test("isSunk returns false when hits are less than length", () => {
  const ship = new Ship(3);

  ship.hit();

  expect(ship.isSunk()).toBe(false);
});

test("isSunk returns true when hits equal the ship length", () => {
  const ship = new Ship(2);

  ship.hit();
  ship.hit();

  expect(ship.isSunk()).toBe(true);
});