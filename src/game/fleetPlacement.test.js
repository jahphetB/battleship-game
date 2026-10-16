import FleetPlacement, { FLEET_LENGTHS } from "./fleetPlacement.js";

test.each([0, 0.25, 0.5, 0.999])("generates a legal complete fleet with random source %s", value => {
  const board = new FleetPlacement(() => value).createBoard();
  expect(board.hasCompleteFleet(FLEET_LENGTHS)).toBe(true);
  const coordinates = board.ships.flatMap(entry => entry.coordinates);
  expect(coordinates).toHaveLength(17);
  expect(new Set(coordinates.map(coordinate => coordinate.join(","))).size).toBe(17);
  expect(coordinates.every(coordinate => board.isValidCoordinate(coordinate))).toBe(true);
  for (const { ship, coordinates: cells } of board.ships) {
    expect(cells).toHaveLength(ship.length);
    expect(cells.every(([x]) => x === cells[0][0]) || cells.every(([, y]) => y === cells[0][1])).toBe(true);
  }
});

test("creates independent boards and fresh undamaged ships", () => {
  const placement = new FleetPlacement(() => 0);
  const first = placement.createBoard();
  const second = placement.createBoard();
  first.receiveAttack(first.ships[0].coordinates[0]);
  expect(second.successfulAttacks).toEqual([]);
  expect(second.ships[0].ship.hits).toBe(0);
});
