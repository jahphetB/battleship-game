import { FLEET } from "./fleet.js";

// Converts a player's placement intent into validated board operations.
export default class ManualPlacement {
  preview(board, shipId, origin, orientation) {
    const definition = FLEET.find(ship => ship.id === shipId);
    if (!definition || !board.isValidCoordinate(origin) || !["horizontal", "vertical"].includes(orientation)) {
      return { valid: false, coordinates: [] };
    }
    const coordinates = Array.from({ length: definition.length }, (_, offset) => [
      origin[0] + (orientation === "horizontal" ? offset : 0),
      origin[1] + (orientation === "vertical" ? offset : 0),
    ]);
    return {
      valid: board.canPlaceShip(definition.length, coordinates, { ignoreShipId: shipId }),
      coordinates,
    };
  }

  place(board, shipId, origin, orientation) {
    const preview = this.preview(board, shipId, origin, orientation);
    if (!preview.valid) return false;
    if (board.ships.some(ship => ship.id === shipId)) return board.moveShip(shipId, preview.coordinates);
    const definition = FLEET.find(ship => ship.id === shipId);
    return Boolean(board.placeShip(definition.length, preview.coordinates, shipId));
  }
}
