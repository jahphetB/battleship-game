export function renderHandoff(game, panel) {
  panel.hidden = game.phase !== "handoff";
  if (panel.hidden) return;
  panel.querySelector("h2").textContent = `Pass the device to ${game.currentPlayer.name}`;
  panel.querySelector(".handoff-instruction").textContent = game.pendingPhase === "placement"
    ? "Other commander, look away. Continue when you are ready to prepare your fleet privately."
    : "Other commander, look away. Continue when you are ready to take your turn.";
  panel.querySelector("button").textContent = `I'm ${game.currentPlayer.name}. Continue`;
  const summary = panel.querySelector(".shot-summary");
  summary.hidden = !game.lastShot;
  if (game.lastShot) {
    const { playerIndex, coordinates: [x, y], hit, sunk } = game.lastShot;
    const result = sunk ? "hit and sunk" : hit ? "hit" : "miss";
    summary.textContent = `${game.players[playerIndex].name} fired at ${String.fromCharCode(65 + x)}${y + 1}: ${result}.`;
  } else {
    summary.textContent = "";
  }
}
