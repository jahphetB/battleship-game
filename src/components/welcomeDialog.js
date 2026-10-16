// Owns the briefing interaction; the supplied callback owns game configuration.
export default class WelcomeDialog {
  constructor(element, { onConfirm, focusAfterClose }) {
    this.element = element;
    this.form = element.querySelector("form");
    this.onConfirm = onConfirm;
    this.focusAfterClose = focusAfterClose;

    this.element.addEventListener("cancel", event => event.preventDefault());
    this.form.addEventListener("submit", event => {
      event.preventDefault();
      const mode = this.form.elements.mode.value;
      if (!this.onConfirm({ mode })) {
        this.element.querySelector("[role=alert]").textContent = "Choose an available mode to continue.";
        return;
      }
      this.element.close();
      this.focusAfterClose.focus();
    });
  }

  open() {
    if (!this.element.open) this.element.showModal();
  }
}
