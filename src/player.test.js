import Player from "./player.js";
import Gameboard from "./gameboard.js";

test("player has its own gameboard", () => {
	const player = new Player("real");

	expect(player.gameboard).toBeInstanceOf(Gameboard);
});

test("player stores its type", () => {
	const player = new Player("computer");

	expect(player.type).toBe("computer");
});