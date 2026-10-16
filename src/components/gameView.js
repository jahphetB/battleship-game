import { renderBoard } from "./board.js";
import { renderStatus } from "./status.js";

export function renderGame(game) {
  renderBoard(game.players[0].gameboard, document.querySelector("#player-board"), { showShips: true });
  renderBoard(game.players[1].gameboard, document.querySelector("#computer-board"), {
    interactive: game.phase === "battle" && game.currentPlayer.type === "human",
  });
  renderStatus(game, document.querySelector("#game-status"));
  document.querySelector("#randomize-ships").disabled = !game.canRandomizeShips();
  const startButton = document.querySelector("#start-battle");
  startButton.hidden = game.phase !== "placement";
}
