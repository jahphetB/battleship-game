export function renderStatus(game, status) {
  let state = "setup";
  let message = "BRIEFING: Choose your mission to begin.";
  if (game.phase === "completed") {
    state = game.mode === "human" || game.winnerIndex === 0 ? "victory" : "defeat";
    message = game.mode === "human" ? `${game.winner.name} WINS: Opposing fleet destroyed.`
      : game.winnerIndex === 0 ? "VICTORY: Enemy fleet destroyed." : "DEFEAT: Your fleet has been destroyed.";
  } else if (game.phase === "handoff") {
    state = "handoff";
    message = `Pass the device to ${game.currentPlayer.name}.`;
  } else if (game.phase === "placement") {
    state = "deployment";
    message = game.mode === "human" ? `${game.currentPlayer.name}: Position your fleet, then select Confirm Fleet.`
      : "DEPLOYMENT: Position your fleet manually or randomize, then select Start Battle.";
  } else if (game.phase === "battle") {
    state = game.currentPlayer.type === "human" ? "player" : "computer";
    message = game.mode === "human" ? `${game.currentPlayer.name}'s turn: Select a target in enemy waters.`
      : game.currentPlayer.type === "human" ? "YOUR TURN: Select a target in enemy waters." : "ENEMY TURN: Incoming fire.";
  }
  status.textContent = message;
  status.dataset.state = state;
}
