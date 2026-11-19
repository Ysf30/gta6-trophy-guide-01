# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Ysf30/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Ysf30/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend is an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. Every trophy is shown with its official name, description and grade, plus a guide written for this page that names its sources, a checklist that saves in the browser, export and import, filters by kind and grade, a spoiler-safe mode that hides story trophies until they are earned, a five-stage road to the platinum, and flags on the missable trophies. The list is the official one as reported from Exophase and cross-checked with PSNProfiles; the methods come from launch-week guides, cited beside each trophy.

## What is inside

- `app/index.html`, `app/app.js`, `app/style.css` — the guide itself, a static single page with no build step.
- `app/data/trophies.json` — all 55 trophies with official names, descriptions, grades, hidden flags, kinds, missable flags, roadmap stages and a cited guide each.
- `screenshots/` — four real renders of the guide running in a browser.
- `main.ts` — the entry program: it copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `serve.ts` — a tiny static server for trying the guide locally.

## Run it

```sh
node serve.ts
# open http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The app is plain static files under `app/` with no build step: `app/index.html` opens in desktop Chrome and works with the network off. `main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
