// Select only the boards the current screen is allowed to render.
export function getGameViewState(game) {
  const showBoards = !["setup", "handoff"].includes(game.phase);
  const showOpponent = showBoards && (game.mode === "computer" || game.phase !== "placement");
  const viewerIndex = game.mode === "computer" ? 0
    : game.phase === "completed" ? 1 - game.winnerIndex : game.activePlayerIndex;
  const viewer = game.players[viewerIndex];
  const opponent = game.players[1 - viewerIndex];
  const revealWinner = game.phase === "completed" && game.winnerIndex === 1 - viewerIndex;
  return {
    ownBoard: showBoards ? viewer.gameboard : null,
    opponentBoard: showOpponent ? opponent.gameboard : null,
    ownTitle: showBoards && game.mode === "human" ? `${viewer.name}'s Fleet` : "Your Fleet",
    opponentTitle: showOpponent && game.mode === "human"
      ? `${opponent.name}'s ${revealWinner ? "Fleet" : "Waters"}`
      : revealWinner ? "Computer Fleet Revealed" : "Enemy Waters",
    revealOpponentShips: revealWinner,
    canAttack: game.phase === "battle" && game.currentPlayer.type === "human",
  };
}
