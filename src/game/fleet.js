export const FLEET = Object.freeze([
  { id: "carrier", name: "Carrier", length: 5 },
  { id: "battleship", name: "Battleship", length: 4 },
  { id: "cruiser", name: "Cruiser", length: 3 },
  { id: "submarine", name: "Submarine", length: 3 },
  { id: "destroyer", name: "Destroyer", length: 2 },
].map(ship => Object.freeze(ship)));

export const FLEET_LENGTHS = Object.freeze(FLEET.map(ship => ship.length));
