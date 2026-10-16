// Owns the briefing interaction; the supplied callback owns game configuration.
export default class WelcomeDialog {
  constructor(element, { onConfirm, focusAfterClose }) {
    this.element = element;
    this.form = element.querySelector("form");
    this.onConfirm = onConfirm;
    this.focusAfterClose = focusAfterClose;

    this.element.addEventListener("cancel", event => event.preventDefault());
    this.element.addEventListener("keydown", event => {
      if (event.key !== "Tab") return;
      const controls = [...this.form.querySelectorAll("input:not(:disabled):checked, button:not(:disabled)")];
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = this.element.ownerDocument.activeElement;
      if (event.shiftKey && (active === first || !controls.includes(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !controls.includes(active))) {
        event.preventDefault();
        first.focus();
      }
    });
    this.form.addEventListener("submit", event => {
      event.preventDefault();
      const mode = this.form.elements.mode.value;
      if (!this.onConfirm({ mode })) {
        this.element.querySelector("[role=alert]").textContent = "Choose an available mode to continue.";
        return;
      }
      this.element.close();
      this.focusAfterClose();
    });
  }

  open() {
    if (!this.element.open) this.element.showModal();
  }
}
