import Game from "./game.js";
import { renderGame } from "./dom.js";

const game = new Game();

game.setupGame();
renderGame(game);