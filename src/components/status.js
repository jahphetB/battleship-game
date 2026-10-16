export function renderStatus(game, status) {
  let state = "setup";
  let message = "BRIEFING: Choose your mission to begin.";
  if (game.phase === "completed") {
    state = game.winnerIndex === 0 ? "victory" : "defeat";
    message = game.winnerIndex === 0 ? "VICTORY: Enemy fleet destroyed." : "DEFEAT: Your fleet has been destroyed.";
  } else if (game.phase === "placement") {
    state = "deployment";
    message = "DEPLOYMENT: Randomize your fleet, then select Start Battle when ready.";
  } else if (game.phase === "battle") {
    state = game.currentPlayer.type === "human" ? "player" : "computer";
    message = game.currentPlayer.type === "human" ? "YOUR TURN: Select a target in enemy waters." : "ENEMY TURN: Incoming fire.";
  }
  status.textContent = message;
  status.dataset.state = state;
}
