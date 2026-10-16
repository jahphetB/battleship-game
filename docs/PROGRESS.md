# Feature milestones

## Milestone 1: Baseline and structure

Completed:

- Installed the existing locked dependencies without changing dependency versions.
- Made `npm test` run Jest, retained `testJ`, and corrected package metadata inherited from the Webpack template.
- Moved model classes and their tests into `src/models/`, and game orchestration and tests into `src/game/`.
- Split DOM rendering into board, status, and game view modules.
- Split the existing CSS into global, command panel, and board styles while preserving the theme and responsive rules.
- Ignored local browser verification artifacts and documented module boundaries and collaboration expectations.

Verification:

- Before and after the refactor: 4 Jest suites, 25 tests passed; production build passed.
- Browser: both boards render 100 cells; the human fleet exposes 17 ship cells; computer ships remain concealed.
- Randomize changes the human fleet while preserving 17 ship cells.
- One human shot produces one human shot marker and one computer response; randomization is disabled once battle starts.
- Desktop and 390 x 844 mobile layouts visually inspected; mobile boards stack and the page does not overflow horizontally.
- The development server starts at `http://127.0.0.1:5173/` during verification.

Environment notes:

- Verification used Node 22.13. Tests, build, and development server succeeded, but the locked development server and proxy dependency report engine warnings. Use a supported Node version as described in the README.
- The browser requested an absent favicon (404). No application JavaScript errors were observed during the smoke check.

## Milestone 2: Rules, phases, and fleet generation

Completed:

- Enforced legal ship geometry and integer attack coordinates; copied input coordinates into board records.
- Added explicit attack outcomes. Repeated hits/misses and invalid shots leave the turn unchanged.
- Added setup, placement, battle, and completed phases, an explicit Start Battle action, full-fleet readiness checks, and winner tracking.
- Extracted an injectable `FleetPlacement` class shared by both participants. Both initial fleets are now randomized; generation is bounded rather than an indefinite random retry loop.
- Disabled attacks before battle, repeated target buttons, and all battle actions after completion. Placement controls lock when battle starts.

Verification: 5 Jest suites / 50 tests pass; production build passes. Browser checks confirmed zero attackable cells during placement, a complete visible human fleet, explicit Start Battle, one computer response per accepted human shot, disabled repeated targets, and locked setup controls during battle. Unit tests cover either winner, incomplete fleets, malformed placement/attacks, phase guards, and deterministic fleet generation. A multiplayer handoff phase belongs to milestone 4, when that behavior exists.

## Remaining milestones

3. Add a themed opening rules dialog and mode selection.
4. Add private setup and turn handoffs for same-device human versus human.
5. Add manual ship placement, rotation, drag feedback, and accessible placement alternatives.
6. Introduce easy, medium, and hard computer strategies using only observed battle information.
7. Add result dialogs, winner fleet reveal, level progression, and restart after round completion.
8. Verify complete rounds, all modes/levels, responsive and keyboard behavior, and update documentation.

The rule issues identified during inspection are resolved. Computer difficulty strategies and local multiplayer remain upcoming features.

Proposed campaign rule: start at level 1, unlock the next level after victory, retry the current level after defeat, and finish the campaign after level 3. Local human versus human uses standalone rounds.

Each milestone should have at least two or three meaningful commits, verified before pushing to GitHub. Report the outcome and wait for approval before starting the next milestone.
