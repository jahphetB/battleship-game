import { FLEET } from "../game/fleet.js";

// Owns selection and pointer gestures; Game remains the authority on placement.
export default class PlacementControls {
  constructor({ game, panel, board, onChange }) {
    this.game = game;
    this.panel = panel;
    this.board = board;
    this.onChange = onChange;
    this.selectedId = null;
    this.orientation = "horizontal";
    this.player = null;
    this.drag = null;
    this.origin = null;
    this.handledPointers = new Set();
    this.tap = null;
    this.message = "Choose a ship to move it, or clear the fleet and place all five.";

    const tray = panel.querySelector(".ship-tray");
    for (const ship of FLEET) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ship-choice";
      button.dataset.shipId = ship.id;
      button.setAttribute("aria-label", `${ship.name}, ${ship.length} cells`);
      button.innerHTML = `<span class="ship-name">${ship.name} (${ship.length})</span><span class="ship-segments" aria-hidden="true">${"<i></i>".repeat(ship.length)}</span><span class="ship-placement-state"></span>`;
      tray.appendChild(button);
    }
    panel.addEventListener("click", event => {
      if (this.handledPointers.has(event.pointerId) || !this.game.canRandomizeShips()) return;
      const ship = event.target.closest(".ship-choice");
      if (ship) this.#select(ship.dataset.shipId);
    });
    panel.querySelector("#rotate-ship").addEventListener("click", () => this.#rotate());
    panel.querySelector("#clear-fleet").addEventListener("click", () => {
      if (!this.game.clearPlayerFleet()) return;
      this.selectedId = FLEET[0].id;
      this.message = "Fleet cleared. Place the Carrier first, then the remaining ships.";
      this.onChange();
    });
    board.addEventListener("click", event => {
      if (this.handledPointers.has(event.pointerId) || !this.game.canRandomizeShips()) return;
      const cell = event.target.closest(".board-cell");
      if (!cell) return;
      if (!this.selectedId && cell.dataset.shipId) this.#select(cell.dataset.shipId);
      else if (this.selectedId) this.#place(this.#coordinate(cell));
    });
    for (const surface of [panel, board]) {
      surface.addEventListener("pointerdown", event => this.#pointerDown(event));
      surface.addEventListener("keydown", event => this.#keyDown(event));
    }
    board.addEventListener("pointermove", event => {
      if (!this.drag && this.selectedId && this.game.canRandomizeShips()) {
        const cell = event.target.closest(".board-cell");
        if (cell) this.#preview(this.#coordinate(cell));
      }
    });
    board.addEventListener("focusin", event => {
      const cell = event.target.closest(".board-cell");
      if (cell && this.selectedId) this.#preview(this.#coordinate(cell));
    });
    board.addEventListener("pointerleave", () => { if (!this.drag) this.#clearPreview(); });
    window.addEventListener("pointermove", event => this.#pointerMove(event), { passive: false });
    window.addEventListener("pointerup", event => this.#pointerUp(event));
    window.addEventListener("pointercancel", () => this.#cancelDrag());
  }

  render() {
    const editable = this.game.canRandomizeShips();
    this.panel.hidden = !editable;
    this.board.classList.toggle("is-placement", editable);
    if (!editable) {
      this.#cancelDrag();
      this.selectedId = null;
      return;
    }
    if (this.player !== this.game.currentPlayer) {
      this.player = this.game.currentPlayer;
      this.selectedId = null;
      this.orientation = "horizontal";
      this.message = "Choose a ship to move it, or clear the fleet and place all five.";
    }
    for (const button of this.panel.querySelectorAll(".ship-choice")) {
      const placed = this.player.gameboard.ships.some(ship => ship.id === button.dataset.shipId);
      button.setAttribute("aria-pressed", String(button.dataset.shipId === this.selectedId));
      button.querySelector(".ship-placement-state").textContent = placed ? "On board" : "Ready to place";
    }
    this.panel.querySelector("#rotate-ship").textContent = `Orientation: ${this.orientation === "horizontal" ? "Horizontal" : "Vertical"}`;
    this.panel.querySelector("#rotate-ship").disabled = !this.selectedId;
    this.panel.querySelector("#placement-progress").textContent = `${this.player.gameboard.ships.length} / ${FLEET.length} ships placed`;
    this.panel.querySelector("#placement-message").textContent = this.message;
  }

  #select(id) {
    this.selectedId = id;
    const entry = this.game.currentPlayer.gameboard.ships.find(ship => ship.id === id);
    if (entry) this.orientation = entry.coordinates[0][0] === entry.coordinates[1][0] ? "vertical" : "horizontal";
    this.message = `${FLEET.find(ship => ship.id === id).name} selected. Drag it, or choose its starting cell.`;
    this.#clearPreview();
    this.render();
  }

  #rotate() {
    if (!this.game.canRandomizeShips() || !this.selectedId) return;
    this.orientation = this.orientation === "horizontal" ? "vertical" : "horizontal";
    this.message = `Orientation changed to ${this.orientation}. Choose a starting cell to place the ship.`;
    this.render();
    if (this.origin) this.#preview(this.origin);
  }

  #coordinate(cell) {
    return [Number(cell.dataset.x), Number(cell.dataset.y)];
  }

  #clearPreview() {
    for (const cell of this.board.querySelectorAll(".placement-valid, .placement-invalid")) {
      cell.classList.remove("placement-valid", "placement-invalid");
    }
  }

  #preview(origin) {
    this.#clearPreview();
    this.origin = origin;
    const preview = this.game.previewPlayerShip(this.selectedId, origin, this.orientation);
    for (const [x, y] of preview.coordinates) {
      this.board.querySelector(`[data-x="${x}"][data-y="${y}"]`)?.classList.add(preview.valid ? "placement-valid" : "placement-invalid");
    }
  }

  #place(origin) {
    const id = this.selectedId;
    if (!id) return;
    this.#clearPreview();
    if (!this.game.placePlayerShip(id, origin, this.orientation)) {
      this.message = "Cannot place here. Keep the whole ship on the grid and clear of other ships.";
      this.render();
      return;
    }
    this.message = `${FLEET.find(ship => ship.id === id).name} placed. Choose another ship, or confirm when all five are ready.`;
    this.selectedId = FLEET.find(ship => !this.game.currentPlayer.gameboard.ships.some(entry => entry.id === ship.id))?.id ?? null;
    this.origin = null;
    this.onChange();
    this.board.querySelector(`[data-x="${origin[0]}"][data-y="${origin[1]}"]`)?.focus();
  }

  #pointerDown(event) {
    if (!this.game.canRandomizeShips() || event.button !== 0 || event.isPrimary === false) return;
    this.handledPointers.delete(event.pointerId);
    const cell = event.target.closest(".board-cell");
    if (cell && this.board.contains(cell) && this.selectedId && cell.dataset.shipId !== this.selectedId) {
      this.tap = { pointerId: event.pointerId, cell, x: event.clientX, y: event.clientY };
      return;
    }
    const source = event.target.closest(".ship-choice, .board-cell.ship");
    if (!source || !source.dataset.shipId) return;
    this.#startDrag(source, event.pointerId, event.clientX, event.clientY);
  }

  #startDrag(source, pointerId, x, y) {
    if (this.selectedId !== source.dataset.shipId) this.#select(source.dataset.shipId);
    const entry = this.game.currentPlayer.gameboard.ships.find(ship => ship.id === this.selectedId);
    const segment = source.classList.contains("board-cell") ? Math.max(
      Number(source.dataset.x) - Math.min(...entry.coordinates.map(([shipX]) => shipX)),
      Number(source.dataset.y) - Math.min(...entry.coordinates.map(([, shipY]) => shipY)),
    ) : 0;
    const offset = this.orientation === "horizontal" ? [segment, 0] : [0, segment];
    this.drag = { pointerId, x, y, moved: false, source, offset };
    source.setPointerCapture(pointerId);
  }

  #cellAt(event) {
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest(".board-cell");
    return cell && this.board.contains(cell) ? cell : null;
  }

  #pointerMove(event) {
    if (this.tap?.pointerId === event.pointerId && Math.hypot(event.clientX - this.tap.x, event.clientY - this.tap.y) > 8) {
      const tap = this.tap;
      this.tap = null;
      if (tap.cell.dataset.shipId) this.#startDrag(tap.cell, event.pointerId, tap.x, tap.y);
    }
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - this.drag.x, event.clientY - this.drag.y) > 6) this.drag.moved = true;
    if (!this.drag.moved) return;
    if (event.cancelable) event.preventDefault();
    const cell = this.#cellAt(event);
    if (cell) {
      const [x, y] = this.#coordinate(cell);
      this.#preview([x - this.drag.offset[0], y - this.drag.offset[1]]);
    } else this.#clearPreview();
  }

  #pointerUp(event) {
    if (this.tap?.pointerId === event.pointerId) {
      const { cell } = this.tap;
      this.tap = null;
      if (cell === this.#cellAt(event)) {
        this.#handlePointer(event.pointerId);
        this.#place(this.#coordinate(cell));
      }
      return;
    }
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    const { moved, source, offset } = this.drag;
    const cell = this.#cellAt(event);
    this.#cancelDrag();
    if (moved || source.classList.contains("board-cell")) {
      this.#handlePointer(event.pointerId);
    }
    if (moved && cell) {
      const [x, y] = this.#coordinate(cell);
      this.#place([x - offset[0], y - offset[1]]);
    } else if (moved) {
      this.message = "Move cancelled. Drop the ship on your fleet grid.";
      this.render();
    }
  }

  #cancelDrag() {
    if (this.drag?.source.hasPointerCapture(this.drag.pointerId)) this.drag.source.releasePointerCapture(this.drag.pointerId);
    this.drag = null;
    this.tap = null;
    this.origin = null;
    this.#clearPreview();
  }

  #handlePointer(pointerId) {
    // Some touch browsers omit or delay click after a drag. Resolve taps on
    // pointerup and ignore any later compatibility click from that gesture.
    this.handledPointers.add(pointerId);
    if (this.handledPointers.size > 20) this.handledPointers.delete(this.handledPointers.values().next().value);
  }

  #keyDown(event) {
    if (!this.game.canRandomizeShips()) return;
    if (event.key.toLowerCase() === "r" && this.selectedId) {
      event.preventDefault();
      this.#rotate();
    } else if (event.key === "Escape") {
      this.#cancelDrag();
      this.selectedId = null;
      this.message = "Selection cancelled. Choose a ship to continue.";
      this.render();
    } else if (event.target.matches(".board-cell") && event.key.startsWith("Arrow")) {
      event.preventDefault();
      const [x, y] = this.#coordinate(event.target);
      const nextX = x + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0);
      const nextY = y + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0);
      this.board.querySelector(`[data-x="${nextX}"][data-y="${nextY}"]`)?.focus();
    }
  }
}
