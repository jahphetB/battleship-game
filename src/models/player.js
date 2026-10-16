import Gameboard from "./gameboard.js";

export default class Player {
	constructor(type, name = "Player") {
		this.type = type;
		this.name = name;
		this.gameboard = new Gameboard();
	}
}