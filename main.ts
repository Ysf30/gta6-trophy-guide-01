// Leonida Legend — the gta6-trophy-guide-01 entry, Node 22, standard library only.
// The guide is app/: a static offline page at app/index.html, its 55 official
// trophies in app/data/trophies.json, each with a guide written for this entry
// that names its sources, plus a saved checklist, filters, a spoiler-safe mode
// and a five-stage road to the platinum. This program hands the guide in: it
// copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json — the summary the judge reads, screenshots plus the
// first load's files and bytes plus the source — using the vendored make.fun
// library. Leave vendor/makefun-frontend.ts alone: the scorer needs
// dossier.json byte for byte as its own copy writes it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const ENTRY_TITLE = 'Leonida Legend — GTA VI trophy guide and tracker';
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The build says how many trophies it hands in, so a wrong data file is loud.
const trophyCount = JSON.parse(readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8')).trophies.length;
console.log(`${ENTRY_TITLE}: handing in ${trophyCount} trophies`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the rest refuse an entry the scorer would refuse — more than 4
// screenshots or one over 256 KiB, more than 993 files and directories in
// app/ or 48 MiB of app files. app/ shares /output's own 1000-entry cap
// with screenshots/ and dossier.json, so leave them room.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
console.log(`${ENTRY_TITLE}: dossier written to ${join(out, 'dossier.json')} (${trophyCount} trophies)`);
