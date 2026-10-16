import Gameboard from "../models/gameboard.js";
import ManualPlacement from "./manualPlacement.js";
import Game from "./game.js";
import { FLEET, FLEET_LENGTHS } from "./fleet.js";

test("a manual fleet includes two independent length-three ships", () => {
  const board = new Gameboard();
  const placement = new ManualPlacement();
  FLEET.forEach((ship, index) => expect(placement.place(board, ship.id, [0, index * 2], "horizontal")).toBe(true));
  expect(board.hasCompleteFleet(FLEET_LENGTHS)).toBe(true);
  expect(new Set(board.ships.map(ship => ship.id)).size).toBe(5);
  expect(board.ships.find(ship => ship.id === "cruiser").ship).not.toBe(board.ships.find(ship => ship.id === "submarine").ship);
});

test("preview is non-mutating; moving and rotating retains the ship object", () => {
  const board = new Gameboard();
  const placement = new ManualPlacement();
  placement.place(board, "carrier", [0, 0], "horizontal");
  const ship = board.ships[0].ship;
  expect(placement.preview(board, "carrier", [0, 0], "vertical").valid).toBe(true);
  expect(board.ships[0].coordinates).toEqual([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]]);
  expect(placement.place(board, "carrier", [0, 0], "vertical")).toBe(true);
  expect(board.ships[0].ship).toBe(ship);
  expect(board.ships[0].coordinates).toEqual([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]);
  expect(board.ships).toHaveLength(1);
});

test.each([
  ["carrier", [9, 0], "horizontal"],
  ["carrier", [0, 9], "vertical"],
  ["missing", [0, 0], "horizontal"],
  ["carrier", [0, 0], "diagonal"],
  ["carrier", null, "horizontal"],
])("invalid placement %# preserves the existing fleet", (id, origin, orientation) => {
  const board = new Gameboard();
  const placement = new ManualPlacement();
  placement.place(board, "carrier", [0, 0], "horizontal");
  const before = JSON.stringify(board.ships);
  expect(placement.place(board, id, origin, orientation)).toBe(false);
  expect(JSON.stringify(board.ships)).toBe(before);
});

test("overlapping moves leave both ships in place", () => {
  const board = new Gameboard();
  const placement = new ManualPlacement();
  placement.place(board, "carrier", [0, 0], "horizontal");
  placement.place(board, "destroyer", [0, 2], "horizontal");
  const before = JSON.stringify(board.ships);
  expect(placement.place(board, "destroyer", [2, 0], "vertical")).toBe(false);
  expect(JSON.stringify(board.ships)).toBe(before);
});

test("randomized ships retain identities and can be manually moved", () => {
  const game = new Game();
  game.setupGame();
  const entry = game.currentPlayer.gameboard.ships[0];
  const [x, y] = entry.coordinates[0];
  const orientation = entry.coordinates[0][1] === entry.coordinates[1][1] ? "horizontal" : "vertical";
  expect(game.placePlayerShip(entry.id, [x, y], orientation)).toBe(true);
  expect(game.currentPlayer.gameboard.ships).toHaveLength(5);
});

test.each(["computer", "human"])("manual placement in %s mode locks outside active deployment", mode => {
  const game = new Game();
  expect(game.clearPlayerFleet()).toBe(false);
  expect(game.placePlayerShip("carrier", [0, 0], "horizontal")).toBe(false);
  game.setupGame({ mode });
  if (mode === "human") {
    expect(game.previewPlayerShip("carrier", [0, 0], "horizontal").valid).toBe(false);
    game.acknowledgeHandoff();
  }
  const otherBoard = game.opponent.gameboard;
  expect(game.clearPlayerFleet()).toBe(true);
  expect(game.opponent.gameboard).toBe(otherBoard);
  expect(game.startBattle()).toBe(false);
  expect(game.confirmFleet()).toBe(false);
  FLEET.forEach((ship, index) => game.placePlayerShip(ship.id, [0, index * 2], "horizontal"));
  if (mode === "computer") game.startBattle();
  else game.confirmFleet();
  const before = JSON.stringify(game.players.map(player => player.gameboard));
  expect(game.clearPlayerFleet()).toBe(false);
  expect(game.placePlayerShip("carrier", [5, 0], "vertical")).toBe(false);
  expect(game.previewPlayerShip("carrier", [5, 0], "vertical").valid).toBe(false);
  expect(JSON.stringify(game.players.map(player => player.gameboard))).toBe(before);
});
