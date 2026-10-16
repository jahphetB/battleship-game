# Architecture

This is a vanilla JavaScript application using Webpack and Jest. Preserve the existing naval theme and keep the implementation proportional to the game.

## Responsibilities and connections

| Module | Responsibility | Dependencies |
| --- | --- | --- |
| `models/ship.js` | Store ship length and damage; determine whether it is sunk. | None |
| `models/gameboard.js` | Own ships and attack history; validate placement and resolve attacks. | `Ship` |
| `models/player.js` | Represent a named human/computer participant and own their board. | `Gameboard` |
| `game/game.js` | Coordinate participants, turns, setup, handoffs, and game completion. | `Player`, injected `FleetPlacement` and `ManualPlacement` |
| `game/fleet.js` | Define the five fleet identities, names, and lengths. | None |
| `game/fleetPlacement.js` | Generate fresh complete fleets using legal candidate placements. | `Gameboard` and an injected random function |
| `game/manualPlacement.js` | Preview and apply a single ship's placement or movement. | Fleet definitions and supplied `Gameboard` |
| `components/board.js` | Render one supplied board, including coordinates and shot markers. | Supplied board and DOM container |
| `components/status.js` | Render the current status into a supplied DOM element. | Supplied game and status element |
| `components/gameView.js` | Connect game state to the page's board, status, and randomize controls. | Board/status renderers and page elements |
| `components/gameViewState.js` | Select the current perspective and omit private boards during setup/handoffs. | Supplied game state; no DOM |
| `components/handoffPanel.js` | Render the next player's readiness screen and the last public shot result. | Supplied game and panel element |
| `components/placementControls.js` | Own ship selection, orientation, pointer gestures, keyboard interaction, and placement feedback. | Injected game, panel, board container, and refresh callback |
| `components/welcomeDialog.js` | Own modal lifecycle, mode form submission, focus wrapping, and focus restoration. | Supplied dialog, configuration callback, and focus target |
| `index.js` | Create the game, initialize it, import styles, and connect user events. | `Game`, game view, styles |

The dependency flow is `index -> game -> models` and `index -> gameView -> renderers`. Models and game logic must not import browser rendering code or query the DOM.

## OOP and SOLID

- Keep state and behavior together in `Ship`, `Gameboard`, `Player`, and `Game`. Prefer composition: a player has a board, and a board has ships. An inheritance hierarchy is not needed for these relationships.
- Apply the single responsibility principle by keeping rendering outside game rules and separating board rendering from page coordination and status rendering.
- Keep small rendering functions where no persistent UI state is needed. Add a class when it owns meaningful state and behavior, rather than wrapping every function in a class.
- As difficulty levels arrive, extract computer targeting behind a small strategy contract. The game should coordinate a supplied strategy rather than accumulate difficulty-specific branches.
- Random and manual placement share `Gameboard` validation. Each placement service has a focused responsibility; the controller delegates legality and phase checks to the game.
- Introduce only the contracts needed by an approved feature. The current refactor establishes boundaries; it does not claim to finish every SOLID improvement.

`Game` receives a fleet generator through its constructor. It owns a participant array, active participant index, per-player fleet readiness, winner index, and the last accepted shot. Its `currentPlayer`, `opponent`, and `winner` getters expose participant identities without tying turn logic to human/computer-specific field names. Both modes use the same board validation and turn completion logic. The existing adjacent computer targeting remains in `Game` until the difficulty milestone.

Computer flow is `setup -> placement -> battle -> completed`. Local flow is `setup -> handoff -> Player 1 placement -> handoff -> Player 2 placement -> battle`. Readiness handoffs are limited to fleet setup. Once both fleets are confirmed, battle begins as Player 1; every non-winning accepted shot immediately switches the active participant and board perspective. There are no battle turn prompts. No attacks, placement changes, or fleet confirmation are accepted during a setup handoff. Confirmed local fleets are locked; neither player can edit the other's board. A winning shot completes the round immediately.

Handoff creation, turn completion, shot recording, and adjacent-target queueing are private class methods. Callers use the public game actions rather than directly invoking internal transitions.

`Gameboard.receiveAttack()` returns an explicit accepted/rejected outcome, including hit and sunk information for accepted shots. Only accepted attacks advance the turn. Board validation checks integer bounds, coordinate count, straight alignment, contiguity, uniqueness, and overlap. Stored coordinates are copied so caller mutations cannot alter the board accidentally.

Fleet generation samples legal placements rather than retrying random positions indefinitely. The injected random source makes placement and attack tests repeatable. Starting battle requires the complete fleet `[5, 4, 3, 3, 2]` on both boards; setup and completed rounds reject attacks, and battle/completed rounds reject randomization.

Startup renders an empty setup state, then opens the native welcome dialog. Only confirmation through its injected callback configures the game and generates fleets. `WelcomeDialog` has no dependency on `Game`; `index.js` connects the two. Unsupported modes leave game state untouched. Both computer and local human-versus-human modes are available.

The modal uses native background blocking, labelled content, initial heading focus, explicit Tab/Shift+Tab wrapping through the selected radio and submit control, and an injected focus callback after confirmation. Escape cannot skip required setup. Its rules describe current play; the planned three-level campaign is clearly marked as upcoming. `dialogs.css` owns its appearance and scrollable viewport bounds.

## Private local play

`getGameViewState()` returns no boards during setup or handoff, and only the active participant's board during local placement. During local battle it selects that player's fleet plus concealed opponent waters. Computer mode always retains the human board perspective, including during a computer turn or defeat.

`renderGame()` clears board children before showing the setup handoff panel, rather than hiding populated boards behind an overlay. This removes ship positions from the rendered page until the player acknowledges readiness. Accepted local shots never invoke the computer controller or open a handoff; rendering immediately selects the next participant's fleet and concealed opponent waters. Focus moves to placement controls after setup acknowledgement and to an available target after a battle turn switches.

`index.js` remains the event coordinator. It delegates rules to `Game` and view selection to the renderers. `handoffPanel.css` is separate from the JavaScript component. Result dialogs, explicit end-of-round fleet reveal, and restart controls remain milestone 7.

## Manual placement

Every fleet slot has a stable ID, so Cruiser and Submarine remain distinct despite both having length three. Random generation assigns these IDs as well, allowing randomized ships to be manually moved without creating duplicate ships.

`ManualPlacement.preview()` generates coordinates from an origin and orientation, then uses board validation while excluding the ship being moved from overlap checks. `place()` revalidates the operation and either creates a missing ship or moves the existing one. Invalid moves preserve both coordinates and ship state. `Game` exposes guarded clear/preview/place actions only during the active player's unconfirmed placement phase; incomplete fleets cannot start battle.

`PlacementControls` owns transient interaction state and private gesture helpers. It receives the game and a refresh callback rather than constructing domain objects. Pointer capture supports dragging from the tray or existing ship cells, preserving the grabbed segment when moving a ship. Touch taps resolve on pointer release, and later compatibility clicks from that gesture are ignored to avoid omitted or duplicated placements. Moving a finger across empty cells cancels tap placement so normal scrolling remains possible. Keyboard placement uses native button activation, arrow navigation, R rotation, and Escape cancellation.

The tray shows placed/unplaced state, orientation, progress, live feedback, and valid/invalid previews. It is hidden and reset outside deployment; no drag or selection state carries into another player's setup. `placementControls.css` keeps all placement styling separate from the class implementation.

## Styles and tests

Keep CSS under `src/styles/`, separate from JavaScript components. `global.css` owns theme variables, page layout, and header styles; `commandPanel.css` owns status and randomize controls; `board.css` owns board layout and cells. Keep responsive rules with the styles they affect.

Keep logic tests beside their modules. Verify rule changes with Jest and rendering/interaction changes in a real browser. Browser snapshots and screenshots are local artifacts ignored by Git.
