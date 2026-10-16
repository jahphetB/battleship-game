// Select only the boards the current screen is allowed to render.
export function getGameViewState(game) {
  const showBoards = !["setup", "handoff"].includes(game.phase);
  const showOpponent = showBoards && (game.mode === "computer" || game.phase !== "placement");
  const viewer = game.mode === "computer" ? game.players[0] : game.currentPlayer;
  const opponent = game.mode === "computer" ? game.players[1] : game.opponent;
  return {
    ownBoard: showBoards ? viewer.gameboard : null,
    opponentBoard: showOpponent ? opponent.gameboard : null,
    ownTitle: showBoards && game.mode === "human" ? `${game.currentPlayer.name}'s Fleet` : "Your Fleet",
    opponentTitle: showOpponent && game.mode === "human" ? `${game.opponent.name}'s Waters` : "Enemy Waters",
    canAttack: game.phase === "battle" && game.currentPlayer.type === "human",
  };
}
