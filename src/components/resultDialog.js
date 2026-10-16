import { DIFFICULTIES } from "../game/computer/createComputerStrategy.js";

export default class ResultDialog {
  constructor(element, { onNextLevel, focusAfterClose }) {
    this.element = element;
    this.onNextLevel = onNextLevel;
    this.focusAfterClose = focusAfterClose;
    this.title = element.querySelector("#result-title");
    this.message = element.querySelector("#result-message");
    this.nextButton = element.querySelector("#next-level");

    element.querySelector("#view-boards").addEventListener("click", () => this.close());
    this.nextButton.addEventListener("click", () => {
      if (this.onNextLevel()) this.close();
    });
    element.addEventListener("close", () => this.focusAfterClose());
  }

  open(game) {
    if (game.phase !== "completed" || this.element.open) return;
    const computerWin = game.mode === "computer" && game.winnerIndex === 1;
    const nextLevel = game.mode === "computer" && game.winnerIndex === 0
      ? DIFFICULTIES.indexOf(game.difficulty) + 1 : DIFFICULTIES.length;
    this.title.textContent = game.mode === "human" ? `${game.winner.name} wins!`
      : computerWin ? "Defeat" : "Victory!";
    this.message.textContent = game.mode === "human"
      ? `${game.winner.name} sank the opposing fleet. The winning fleet is revealed on the board.`
      : computerWin ? "The computer sank your fleet. Its ships are revealed on the board."
        : nextLevel < DIFFICULTIES.length
          ? `Enemy fleet destroyed. Level ${nextLevel + 1} is ready.`
          : "Enemy fleet destroyed. You completed Level 3!";
    this.nextButton.hidden = nextLevel >= DIFFICULTIES.length;
    this.element.showModal();
    this.title.focus();
  }

  close() {
    if (this.element.open) this.element.close();
  }
}
