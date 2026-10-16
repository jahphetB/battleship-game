# Architecture

This is a vanilla JavaScript application using Webpack and Jest. Preserve the existing naval theme and keep the implementation proportional to the game.

## Responsibilities and connections

| Module | Responsibility | Dependencies |
| --- | --- | --- |
| `models/ship.js` | Store ship length and damage; determine whether it is sunk. | None |
| `models/gameboard.js` | Own ships and attack history; validate placement and resolve attacks. | `Ship` |
| `models/player.js` | Represent a participant and own that participant's board. | `Gameboard` |
| `game/game.js` | Coordinate participants, turns, setup, and game completion. | `Player` |
| `game/fleetPlacement.js` | Generate fresh complete fleets using legal candidate placements. | `Gameboard` and an injected random function |
| `components/board.js` | Render one supplied board, including coordinates and shot markers. | Supplied board and DOM container |
| `components/status.js` | Render the current status into a supplied DOM element. | Supplied game and status element |
| `components/gameView.js` | Connect game state to the page's board, status, and randomize controls. | Board/status renderers and page elements |
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

`Game` receives a fleet generator through its constructor and owns the round lifecycle: `setup -> placement -> battle -> completed`. A separate handoff phase will be introduced with local multiplayer. Both players now use randomized fleets. The existing adjacent computer targeting remains in `Game` until the difficulty milestone.

`Gameboard.receiveAttack()` returns an explicit accepted/rejected outcome, including hit and sunk information for accepted shots. Only accepted attacks advance the turn. Board validation checks integer bounds, coordinate count, straight alignment, contiguity, uniqueness, and overlap. Stored coordinates are copied so caller mutations cannot alter the board accidentally.

Fleet generation samples legal placements rather than retrying random positions indefinitely. The injected random source makes placement and attack tests repeatable. Starting battle requires the complete fleet `[5, 4, 3, 3, 2]` on both boards; setup and completed rounds reject attacks, and battle/completed rounds reject randomization.

Startup renders an empty setup state, then opens the native welcome dialog. Only confirmation through its injected callback configures the game and generates fleets. `WelcomeDialog` has no dependency on `Game`; `index.js` connects the two. Unsupported modes leave game state untouched. Local human-versus-human is visibly unavailable until its private setup and handoff behavior is implemented.

The modal uses native background blocking, labelled content, initial heading focus, explicit Tab/Shift+Tab wrapping, and focus restoration to Randomize Ships after confirmation. Escape cannot skip required setup. Its rules describe current play; the planned three-level campaign is clearly marked as upcoming. `dialogs.css` owns its appearance and scrollable viewport bounds.

## Styles and tests

Keep CSS under `src/styles/`, separate from JavaScript components. `global.css` owns theme variables, page layout, and header styles; `commandPanel.css` owns status and randomize controls; `board.css` owns board layout and cells. Keep responsive rules with the styles they affect.

Keep logic tests beside their modules. Verify rule changes with Jest and rendering/interaction changes in a real browser. Browser snapshots and screenshots are local artifacts ignored by Git.
