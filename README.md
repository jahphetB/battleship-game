# Battleship

https://jahphetb.github.io/battleship-game/

A Battleship game built with JavaScript using Test Driven Development with Jest.

## Features

- Player vs. computer gameplay
- Same-device human vs. human with private fleet setup and automatic battle turns
- Themed opening rules briefing and opponent picker
- Randomized ship placement for both fleets
- Manual ship placement with mouse/touch dragging, rotation, and click/keyboard alternatives
- Explicit fleet confirmation before battle
- Validated placement and attacks; repeated shots do not consume a turn
- Three computer difficulties with distinct search and pursuit strategies
- Hit and miss tracking
- Win/loss detection
- Responsive naval-themed interface
- Test-driven game logic with Jest

## Built With

- JavaScript
- HTML
- CSS
- Jest
- Webpack

## Development

Use Node.js 22.15 or later in the Node 22 release line, or a newer supported LTS release. The locked development server requires at least Node 22.15; Node 22.13 produces engine warnings.

Install the locked dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

`npm run testJ` remains available as an alias. For a single-process test run, use `npm test -- --runInBand` (`npm.cmd` in PowerShell if argument forwarding fails).

## Project structure

```text
src/
  index.js                 Application startup and event wiring
  template.html            Page markup
  models/                  Ship, Gameboard, Player, and their tests
  game/                    Game orchestration, placement, computer strategies, and tests
  components/              Board, status, private game view, handoff panel, and welcome dialog
  styles/                  Global and separate component styles
```

See [Architecture](docs/ARCHITECTURE.md) for responsibilities and OOP/SOLID guidelines, and [Progress](docs/PROGRESS.md) for the feature roadmap and milestone checks.

On startup, choose **Human vs computer** or **Human vs human**, then select **Deploy Fleet**. For computer play, select a difficulty before deploying; use **Randomize Ships** or manual placement as desired, then **Start Battle**. The current level stays visible above the boards.

In local two-player mode, Player 1 privately prepares and confirms their fleet, followed by Player 2. Battle starts immediately after Player 2 confirms. After each valid shot, the boards switch automatically to the next player's perspective. Readiness screens appear only during fleet setup.

To place ships manually, use **Clear Fleet** or adjust the randomized layout. Select a ship in the tray, then drag it or choose its starting cell. **Orientation** or **R** changes its direction; arrow keys move focus around the grid, Enter/Space places the selected ship, and Escape cancels selection. Drag existing ships directly to reposition them. Green previews are valid; red previews indicate an overlap or an edge violation. All five ships must be placed before starting or confirming, and placement locks when battle starts.

| Computer level | Behavior |
| --- | --- |
| 1: Easy | Mostly random search; sometimes follows a hit. |
| 2: Medium | Pursues adjacent hits, infers ship direction, and searches alternating cells. |
| 3: Hard | Scores possible remaining ship positions and pursues strong clues, with rare unfocused choices. |

All levels avoid repeated shots and use only earned shot results. Choose any level before a round; win-to-advance progression and end-of-round controls are planned for milestone 7.

## Collaboration workflow

Work through one approved milestone at a time. Explain the changes and their file connections, verify the result, and report before advancing. Each milestone should contain two or three focused commits and be pushed to GitHub after verification.

For this Battleship project, the user has granted standing permission to create commits and push verified work to GitHub without separate approval. This permission applies only to this project; approval is still required before starting the next milestone.
