export function renderStatus(game, status) {
  let state = "setup";
  let message = "BRIEFING: Choose your mission to begin.";
  if (game.phase === "completed") {
    state = game.winner === "real": "victory" : "defeat";
    message = game.winner === "real": "VICTORY: Enemy fleet destroyed." : "DEFEAT: Your fleet has been destroyed.";
  } else if (game.phase === "placement") {
    state = "deployment";
    message = "DEPLOYMENT: Randomize your fleet, then select Start Battle when ready.";
  } else if (game.phase === "battle") {
    state = game.currentTurn === "real": "player" : "computer";
    message = game.currentTurn === "real": "YOUR TURN: Select a target in enemy waters." : "ENEMY TURN: Incoming fire.";
  }
  status.textContent = message;
  status.dataset.state = state;
}
