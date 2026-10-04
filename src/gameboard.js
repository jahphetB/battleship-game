import Ship from "./ship.js";

export default class Gameboard {
  constructor() {
    this.ships = [];
  }

  placeShip(length, coordinates) {
    const ship = new Ship(length);

    this.ships.push({
      ship,
      coordinates,
    });

    return ship;
  }
}