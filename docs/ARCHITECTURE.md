# Architecture

This is a vanilla JavaScript application using Webpack and Jest. Preserve the existing naval theme and keep the implementation proportional to the game.

## Responsibilities and connections

| Module | Responsibility | Dependencies |
| --- | --- | --- |
| `models/ship.js` | Store ship length and damage; determine whether it is sunk. | None |
| `models/gameboard.js` | Own ships and attack history; validate placement and resolve attacks. | `Ship` |
| `models/player.js` | Represent a named human/computer participant and own their board. | `Gameboard` |
| `game/game.js` | Coordinate participants, turns, setup, handoffs, and game completion. | `Player`, injected `FleetPlacement` |
| `game/fleetPlacement.js` | Generate fresh complete fleets using legal candidate placements. | `Gameboard` and an injected random function |
| `components/board.js` | Render one supplied board, including coordinates and shot markers. | Supplied board and DOM container |
| `components/status.js` | Render the current status into a supplied DOM element. | Supplied game and status element |
| `components/gameView.js` | Connect game state to the page's board, status, and randomize controls. | Board/status renderers and page elements |
| `components/gameViewState.js` | Select the current perspective and omit private boards during setup/handoffs. | Supplied game state; no DOM |
| `components/handoffPanel.js` | Render the next player's readiness screen and the last public shot result. | Supplied game and panel element |
| `components/welcomeDialog.js` | Own modal lifecycle, mode form submission, focus wrapping, and focus restoration. | Supplied dialog, configuration callback, and focus target |
| `index.js` | Create the game, initialize it, import styles, and connect user events. | `Game`, game view, styles |

The dependency flow is `index -> game -> models` and `index -> gameView -> renderers`. Models and game logic must not import browser rendering code or query the DOM.

## OOP and SOLID

- Keep state and behavior together in `Ship`, `Gameboard`, `Player`, and `Game`. Prefer composition: a player has a board, and a board has ships. An inheritance hierarchy is not needed for these relationships.
- Apply the single responsibility principle by keeping rendering outside game rules and separating board rendering from page coordination and status rendering.
- Keep small rendering functions where no persistent UI state is needed. Add a class when it owns meaningful state and behavior, rather than wrapping every function in a class.
- As difficulty levels arrive, extract computer targeting behind a small strategy contract. The game should coordinate a supplied strategy rather than accumulate difficulty-specific branches.
- As placement expands, extract reusable fleet placement behavior. Random and manual placement must share board validation.
- Introduce only the contracts needed by an approved feature. The current refactor establishes boundaries; it does not claim to finish every SOLID improvement.

`Game` receives a fleet generator through its constructor. It owns a participant array, active participant index, per-player fleet readiness, winner index, and the last accepted shot. Its `currentPlayer`, `opponent`, and `winner` getters expose participant identities without tying turn logic to human/computer-specific field names. Both modes use the same board validation and turn completion logic. The existing adjacent computer targeting remains in `Game` until the difficulty milestone.

Computer flow is `setup -> placement -> battle -> completed`. Local flow is `setup -> handoff -> Player 1 placement -> handoff -> Player 2 placement -> handoff -> battle`. Every non-winning local shot returns to `handoff`, with the next participant and destination phase recorded. Only explicit handoff acknowledgement enters placement/battle. No attacks, randomization, or fleet confirmation are accepted during a handoff. Confirmed local fleets are locked; neither player can randomize the other's board. A winning shot completes the round immediately without another handoff.

Handoff creation, turn completion, shot recording, and adjacent-target queueing are private class methods. Callers use the public game actions rather than directly invoking internal transitions.

`Gameboard.receiveAttack()` returns an explicit accepted/rejected outcome, including hit and sunk information for accepted shots. Only accepted attacks advance the turn. Board validation checks integer bounds, coordinate count, straight alignment, contiguity, uniqueness, and overlap. Stored coordinates are copied so caller mutations cannot alter the board accidentally.

Fleet generation samples legal placements rather than retrying random positions indefinitely. The injected random source makes placement and attack tests repeatable. Starting battle requires the complete fleet `[5, 4, 3, 3, 2]` on both boards; setup and completed rounds reject attacks, and battle/completed rounds reject randomization.

Startup renders an empty setup state, then opens the native welcome dialog. Only confirmation through its injected callback configures the game and generates fleets. `WelcomeDialog` has no dependency on `Game`; `index.js` connects the two. Unsupported modes leave game state untouched. Both computer and local human-versus-human modes are available.

The modal uses native background blocking, labelled content, initial heading focus, explicit Tab/Shift+Tab wrapping through the selected radio and submit control, and an injected focus callback after confirmation. Escape cannot skip required setup. Its rules describe current play; the planned three-level campaign is clearly marked as upcoming. `dialogs.css` owns its appearance and scrollable viewport bounds.

## Private local play

`getGameViewState()` returns no boards during setup or handoff, and only the active participant's board during local placement. During local battle it selects that player's fleet plus concealed opponent waters. Computer mode always retains the human board perspective, including during a computer turn or defeat.

`renderGame()` clears board children before showing the handoff panel, rather than hiding populated boards behind an overlay. This removes ship positions and shot markers from the rendered page until the next player acknowledges readiness. `renderHandoff()` displays only the next player's name, instructions, and the last public shot result. Accepted local shots never invoke the computer controller. Focus moves to the handoff Continue button, then to placement controls or an available target after acknowledgement.

`index.js` remains the event coordinator. It delegates rules to `Game` and view selection to the renderers. `handoffPanel.css` is separate from the JavaScript component. Result dialogs, explicit end-of-round fleet reveal, and restart controls remain milestone 7.

## Styles and tests

Keep CSS under `src/styles/`, separate from JavaScript components. `global.css` owns theme variables, page layout, and header styles; `commandPanel.css` owns status and randomize controls; `board.css` owns board layout and cells. Keep responsive rules with the styles they affect.

Keep logic tests beside their modules. Verify rule changes with Jest and rendering/interaction changes in a real browser. Browser snapshots and screenshots are local artifacts ignored by Git.
