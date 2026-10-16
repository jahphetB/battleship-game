# Battleship

https://jahphetb.github.io/battleship-game/

A Battleship game built with JavaScript using Test Driven Development with Jest.

## Features

- Player vs. computer gameplay
- Themed opening rules briefing and opponent picker
- Randomized ship placement for both fleets
- Explicit fleet confirmation before battle
- Validated placement and attacks; repeated shots do not consume a turn
- Smarter computer AI that targets adjacent cells after a hit
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
  game/                    Game orchestration and its tests
  components/              Board, status, game view, and welcome dialog
  styles/                  Global, command panel, board, and dialog styles
```

See [Architecture](docs/ARCHITECTURE.md) for responsibilities and OOP/SOLID guidelines, and [Progress](docs/PROGRESS.md) for the feature roadmap and milestone checks.

On startup, read the briefing and select **Deploy Fleet**. Use **Randomize Ships** as desired, then **Start Battle**. The opponent picker currently enables computer play; local two-player play is planned for milestone 4. The briefing previews the three-level campaign, which will be implemented with difficulty strategies and progression in later milestones.

## Collaboration workflow

Work through one approved milestone at a time. Explain the changes and their file connections, verify the result, and report before advancing. Each milestone should contain at least two or three focused commits and be pushed to GitHub after verification, as requested for this feature plan.
