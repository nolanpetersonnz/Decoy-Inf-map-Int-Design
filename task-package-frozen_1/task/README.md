# Experiment task

Self-contained choice task (`index.html`) — no server, no dependencies,
no network. Data stays on the machine it runs on.

## Session flow

Consent + participant ID → stage-1 willingness-to-pay (6 allowance
levels) → 44 choice trials (6 decoy cells × 5, 8 decoy-absent baseline,
4 real-market fillers, 2 catch trials; shuffled) → one awareness-probe
question → `decoy_<ID>.csv` downloads to the machine. About 5–10
minutes per participant.

The short format trades per-participant precision for feasibility:
~800 pooled choices across n = 18 still discriminate the models because
the six cells sit where predictions disagree by 40–75 pp, but pooled /
hierarchical analysis is primary, and with only 4 fillers the repeating
target pair is noticeable — the awareness probe carries more weight.
Trial counts are one number each in `CONFIG` if a longer session is ever
wanted.

Everything random is seeded from the participant ID plus a fixed study
seed, so a session is exactly reproducible from the ID, and the seed is
written into every data row alongside the task version string.

## Running a session

Open `index.html` in any modern browser (double-click works), give the
participant their ID (P01…P18), let them work through it, and collect
the downloaded CSV into `data/raw/` in the repo afterwards. One machine
or several in parallel — sessions are independent.

## Before ANY real data: the freeze

Targets and decoy cells live in the `CONFIG` block at the top of
`index.html` and are currently the PROVISIONAL set (marked in the
version string). After the titration pilot: update `A`, `B`, and
`cells`, bump `version`, re-run the robot test, commit — and only then
collect. The version string in every CSV row ties data to the exact
config that produced it.

## The robot self-test

`index.html?robot=cheapest` runs the entire session instantly with an
always-pick-the-cheapest policy and shows a pass/fail report of design-
matrix checks: exact trial counts per block and cell, unique trial
indices, target values matching config on every decoy trial, slot
randomisation balance, policy consistency (every logged choice really is
the cheapest of the logged options — the end-to-end logging check), and
CSV integrity. `?robot=bigdata` and `?robot=random` give alternative
policies. `test_robot.js` (run with `node test_robot.js`) drives all of
this headlessly plus a determinism check (same ID → identical sequence)
and a live click-through. Re-run both after ANY edit to `index.html`,
and show the robot report to Dr. Dumbalska — it is the answer to "how do
you know your generated task is correct?".

## Hosting ("launching")

For in-person sessions the local file is the recommended deployment: no
hosting, no participant data ever leaving the room — which matches the
consent text. If a hosted link is needed (e.g. a participant's own
laptop), enable GitHub Pages on the repo (Settings → Pages → deploy from
main) and the task serves at `/task/`; note the CSV still downloads to
the participant's machine and must be sent back to you.
