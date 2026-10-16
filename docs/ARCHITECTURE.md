# Architecture

This is a vanilla JavaScript application using Webpack and Jest. Preserve the existing naval theme and keep the implementation proportional to the game.

## Responsibilities and connections

| Module | Responsibility | Dependencies |
| --- | --- | --- |
| `models/ship.js` | Store ship length and damage; determine whether it is sunk. | None |
| `models/gameboard.js` | Own ships and attack history; validate placement and resolve attacks. | `Ship` |
| `models/player.js` | Represent a participant and own that participant's board. | `Gameboard` |
| `game/game.js` | Coordinate participants, turns, setup, and game completion. | `Player` |
| `components/board.js` | Render one supplied board, including coordinates and shot markers. | Supplied board and DOM container |
| `components/status.js` | Render the current status into a supplied DOM element. | Supplied game and status element |
| `components/gameView.js` | Connect game state to the page's board, status, and randomize controls. | Board/status renderers and page elements |
| `index.js` | Create the game, initialize it, import styles, and connect user events. | `Game`, game view, styles |

The dependency flow is `index -> game -> models` and `index -> gameView -> renderers`. Models and game logic must not import browser rendering code or query the DOM.

## OOP and SOLID

- Keep state and behavior together in `Ship`, `Gameboard`, `Player`, and `Game`. Prefer composition: a player has a board, and a board has ships. An inheritance hierarchy is not needed for these relationships.
- Apply the single responsibility principle by keeping rendering outside game rules and separating board rendering from page coordination and status rendering.
- Keep small rendering functions where no persistent UI state is needed. Add a class when it owns meaningful state and behavior, rather than wrapping every function in a class.
- As difficulty levels arrive, extract computer targeting behind a small strategy contract. The game should coordinate a supplied strategy rather than accumulate difficulty-specific branches.
- As placement expands, extract reusable fleet placement behavior. Random and manual placement must share board validation.
- Introduce only the contracts needed by an approved feature. The current refactor establishes boundaries; it does not claim to finish every SOLID improvement.

`Game` still contains the existing fixed setup, random placement, and adjacent targeting logic. Those behaviors are deliberately preserved in milestone one and will be separated as subsequent milestones need them.

## Styles and tests

Keep CSS under `src/styles/`, separate from JavaScript components. `global.css` owns theme variables, page layout, and header styles; `commandPanel.css` owns status and randomize controls; `board.css` owns board layout and cells. Keep responsive rules with the styles they affect.

Keep logic tests beside their modules. Verify rule changes with Jest and rendering/interaction changes in a real browser. Browser snapshots and screenshots are local artifacts ignored by Git.
