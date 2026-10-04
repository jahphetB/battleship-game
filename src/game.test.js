import Game from "./game.js";

test("game starts with the real player's turn", () => {
	const game = new Game();

	expect(game.currentTurn).toBe("real");
});

test("game contains a real player and a computer player", () => {
	const game = new Game();

	expect(game.realPlayer.type).toBe("real");
	expect(game.computerPlayer.type).toBe("computer");
});

test("real player can attack the computer gameboard", () => {
	const game = new Game();

	const ship = game.computerPlayer.gameboard.placeShip(1, [[0, 0]]);

	game.attack([0, 0]);

	expect(ship.hits).toBe(1);
});

test("turn switches to computer after the real player attacks", () => {
	const game = new Game();

	game.attack([0, 0]);

	expect(game.currentTurn).toBe("computer");
});

test("computer can attack the real player's gameboard", () => {
	const game = new Game();

	const ship = game.realPlayer.gameboard.placeShip(1, [[0, 0]]);

	jest.spyOn(Math, "random").mockReturnValue(0);

	game.computerAttack();

	expect(ship.hits).toBe(1);

	Math.random.mockRestore();
});

test("turn switches back to real player after computer attacks", () => {
	const game = new Game();

	jest.spyOn(Math, "random").mockReturnValue(0);

	game.computerAttack();

	expect(game.currentTurn).toBe("real");

	Math.random.mockRestore();
});

test("computer does not attack the same coordinate twice", () => {
	const game = new Game();

	jest
		.spyOn(Math, "random")
		.mockReturnValueOnce(0)
		.mockReturnValueOnce(0)
		.mockReturnValueOnce(0)
		.mockReturnValueOnce(0)
		.mockReturnValueOnce(0.1)
		.mockReturnValueOnce(0.1);

	game.computerAttack();
	game.computerAttack();

	expect(game.realPlayer.gameboard.missedAttacks).toEqual([
		[0, 0],
		[1, 1],
	]);

	Math.random.mockRestore();
});

test("game ends when all computer ships are sunk", () => {
	const game = new Game();

	game.computerPlayer.gameboard.placeShip(1, [[0, 0]]);

	game.attack([0, 0]);

	expect(game.isGameOver()).toBe(true);
});

test("game continues while the computer still has an unsunk ship", () => {
	const game = new Game();

	game.computerPlayer.gameboard.placeShip(2, [
		[0, 0],
		[0, 1],
	]);

	game.attack([0, 0]);

	expect(game.isGameOver()).toBe(false);
});

test("setupGame places ships on both players' gameboards", () => {
	const game = new Game();

	game.setupGame();

	expect(game.realPlayer.gameboard.ships.length).toBeGreaterThan(0);
	expect(game.computerPlayer.gameboard.ships.length).toBeGreaterThan(0);
});