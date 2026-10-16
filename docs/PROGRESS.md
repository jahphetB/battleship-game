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

## Milestone 3: Welcome briefing and mode selection

Completed:

- Added a native opening modal matching the naval palette, typography, controls, and panel styling.
- Added concise fleet, placement, attack, and victory rules plus a clearly labelled preview of Easy / Medium / Hard.
- Added an opponent picker: computer play is available; human-versus-human is disabled and labelled Coming soon until milestone 4.
- Added an OOP `WelcomeDialog` controller with an injected configuration callback. The game stays in setup with empty boards until confirmation, then enters placement rather than starting battle automatically.
- Added initial heading focus, modal background blocking, Escape protection, forward/reverse focus wrapping, and focus restoration after confirmation.
- Added round-status regression tests. A build caught a status-text syntax error during implementation; it was corrected before final verification.

Verification:

- 6 Jest suites / 57 tests pass; production build and `git diff --check` pass.
- Clean browser reload reported zero application page errors. Desktop briefing verified at 1440 x 1000, with the full dialog and Deploy Fleet visible.
- Mobile briefing verified at 390 x 844: no horizontal dialog overflow, vertical scrolling available, and keyboard-accessible confirmation reachable.
- Before confirmation: empty fleets, no attackable cells, randomization disabled, and initial focus on the dialog heading.
- Escape leaves the dialog open; Tab and Shift+Tab wrap through available controls and skip the disabled mode.
- Keyboard confirmation closes the dialog, restores focus to Randomize Ships, creates a 17-cell human fleet, conceals computer ships, and keeps attacks blocked until Start Battle.
- A complete browser round reached defeat after 71 human shots and 71 computer shots, then disabled all targets and kept setup controls locked. Both winner outcomes are also covered by logic tests.

## Milestone 4: Local human-versus-human play

Completed:

- Enabled Human vs human in the opening opponent picker, with instructions for private same-device play.
- Generalized the OOP game model to named participants, an active-player index, per-player readiness, winner identity, and the last accepted shot. Computer play uses the same turn completion rules.
- Added private fleet setup for Player 1 and Player 2. Each confirms their own complete fleet; confirmed fleets and the other player's fleet cannot be randomized.
- Added explicit readiness handoffs before either player's setup, before the first shot, and after every non-winning local shot. Internal turn transitions are private class methods.
- Added a separate handoff renderer and stylesheet. Both board containers are cleared before the handoff screen appears; the screen shows only the next player's name and the public shot result.
- Added a pure view-selection function with privacy tests. Local play shows the active player's fleet and concealed opponent waters; computer play always retains the human perspective.
- Added named turn/winner status, keyboard focus transfers, enabled-mode radio focus wrapping, and the neutral `opponent-board` DOM name.
- Recorded standing commit/push permission for this repository in the README. Milestone progression remains approval-gated.

Verification:

- 8 Jest suites / 73 tests pass; production build and `git diff --check` pass.
- Logic tests cover both local winners, independent fleet setup, incomplete-fleet rejection, confirmed-fleet locks, rejected/repeated shots, blocked handoff actions, and absence of computer actions in local mode.
- Browser setup/turn checks verified five consecutive handoffs with zero board cells and zero ship cells in the DOM, focus on the named Continue button, and unchanged independent fleets when perspectives returned.
- A complete mobile round at 390 x 844 ended with Player 2 winning after 78 shots per player. The continuation run checked 153 handoffs for zero board/ship cells and no horizontal page overflow. The winning shot completed the round immediately and left zero enabled targets.
- Desktop private placement and handoff screens, plus mobile handoff and battle layouts, were visually inspected.
- Keyboard arrows selected either mode; Tab/Shift+Tab wrapped through the selected radio and submit button. Keyboard confirmation routed to the appropriate local handoff or computer placement control.
- A clean-load computer regression check reported zero application page errors: one human shot produced one computer response, all 17 human ship cells remained visible, enemy ships remained concealed, and no handoff appeared.

## Remaining milestones

Milestone 4 follow-up: at the user's request, battle now starts immediately after both fleets are confirmed and switches perspectives automatically after each accepted local shot. Readiness handoffs remain only during fleet setup. The original milestone-4 verification above describes the earlier behavior. Updated logic and view tests pass (73 tests).

5. Add manual ship placement, rotation, drag feedback, and accessible placement alternatives.
6. Introduce easy, medium, and hard computer strategies using only observed battle information.
7. Add result dialogs, winner fleet reveal, level progression, and restart after round completion.
8. Verify complete rounds, all modes/levels, responsive and keyboard behavior, and update documentation.

The rule issues identified during inspection are resolved, and both play modes are available. Manual placement, difficulty strategies, and end-of-round controls remain upcoming features.

Proposed campaign rule: start at level 1, unlock the next level after victory, retry the current level after defeat, and finish the campaign after level 3. Local human versus human uses standalone rounds.

Each milestone should have at least two or three meaningful commits, verified before pushing to GitHub. Report the outcome and wait for approval before starting the next milestone.

For this project only, the user has authorized committing and pushing verified work without separate approval.
