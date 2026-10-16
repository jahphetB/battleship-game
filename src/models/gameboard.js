import Ship from "./ship.js";

export const BOARD_SIZE = 10;

export default class Gameboard {
  constructor() {
    this.ships = [];
    this.missedAttacks = [];
    this.successfulAttacks = [];
  }

  isValidCoordinate(coordinate) {
    return Array.isArray(coordinate) && coordinate.length === 2 &&
      coordinate.every(value => Number.isInteger(value) && value >= 0 && value < BOARD_SIZE);
  }

  canPlaceShip(length, coordinates) {
    if (!Number.isInteger(length) || length < 1 || length > BOARD_SIZE ||
        !Array.isArray(coordinates) || coordinates.length !== length ||
        !coordinates.every(coordinate => this.isValidCoordinate(coordinate))) return false;

    const horizontal = coordinates.every(([, y]) => y === coordinates[0][1]);
    const vertical = coordinates.every(([x]) => x === coordinates[0][0]);
    if (!horizontal && !vertical) return false;
    const positions = coordinates.map(([x, y]) => horizontal ? x : y).sort((a, b) => a - b);
    if (!positions.every((value, index) => value === positions[0] + index)) return false;

    return !this.ships.some(({ coordinates: existing }) =>
      existing.some(([shipX, shipY]) => coordinates.some(([x, y]) => x === shipX && y === shipY)));
  }

  placeShip(length, coordinates) {
    if (!this.canPlaceShip(length, coordinates)) return null;
    const ship = new Ship(length);
    this.ships.push({ ship, coordinates: coordinates.map(coordinate => [...coordinate]) });
    return ship;
  }

  hasAttackAt([x, y]) {
    return [...this.successfulAttacks, ...this.missedAttacks]
      .some(([attackX, attackY]) => x === attackX && y === attackY);
  }

  receiveAttack(coordinates) {
    if (!this.isValidCoordinate(coordinates) || this.hasAttackAt(coordinates)) {
      return { accepted: false };
    }
    const target = this.ships.find(({ coordinates: cells }) =>
      cells.some(([x, y]) => x === coordinates[0] && y === coordinates[1]));
    if (target) {
      target.ship.hit();
      this.successfulAttacks.push([...coordinates]);
      return { accepted: true, hit: true, sunk: target.ship.isSunk() };
    }
    this.missedAttacks.push([...coordinates]);
    return { accepted: true, hit: false, sunk: false };
  }

  hasCompleteFleet(lengths) {
    const actual = this.ships.map(({ ship }) => ship.length).sort((a, b) => a - b);
    const expected = [...lengths].sort((a, b) => a - b);
    return actual.length === expected.length && actual.every((length, index) => length === expected[index]);
  }

  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every(({ ship }) => ship.isSunk());
  }
}
