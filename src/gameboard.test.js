import Gameboard from "./gameboard.js";

test("places a ship at specific coordinates", () => {
  const gameboard = new Gameboard();

  const ship = gameboard.placeShip(2, [
    [0, 0],
    [0, 1],
  ]);

  expect(ship.length).toBe(2);
});