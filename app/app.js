// Leonida Legend — GTA VI trophy guide and tracker.
// Fetches app/data/trophies.json, paints the checklist, the platinum roadmap and
// the missable list, and stores progress in localStorage with export and import.
const SAVE_KEY = 'leonida-legend-progress-v1';
const STAGES = [
  { stage: 1, title: 'Stage 1 — Play the story', text: 'Chapters 1 to 4 and the final mission. Do Lucia’s balcony meditation in Chapter 1 before the chapter ends, rob Kingpin Bowling in Chapter 2, and keep a manual save at the start of every chapter.' },
  { stage: 2, title: 'Stage 2 — Side stories and strangers', text: 'The six side-story finales and the 8 stranger strands. Do the Race Against Yago in Chapter 3 the moment it appears — it is time-sensitive and counts toward Strangers & Freaks.' },
  { stage: 3, title: 'Stage 3 — Partner and robbery one-offs', text: 'Partner trophies with Jason and Lucia together, the robbery set, the airport plane, the tank and the hidden one-offs. Bring your partner to the bank vaults: you cannot carry all the bags alone.' },
  { stage: 4, title: 'Stage 4 — Collectibles and the long grind', text: 'Cards, WAiNK spots, vehicles, garages, stunts, Challenges, races and the shooting ranges. Scan traffic with WAiNK as you drive and keep going past each trophy’s count: 100% needs more of everything.' },
  { stage: 5, title: 'Stage 5 — 100% cleanup and the platinum', text: 'The 100% checklist appears after the story under Progress, Stats, 100% Completion. Finish it for A Long Road, and Vice Got a Price! pops with it.' },
];
const KIND_NAMES = { story: 'Story', collectibles: 'Collectibles', activities: 'Activities' };
const GRADE_NAMES = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

const guide = {
  trophies: [],
  earned: new Set(),
  spoiler: false,
  kind: 'all',
  grade: 'all',
  earnedFilter: 'all',
  search: '',
  openId: 28,
};

const listEl = document.getElementById('trophyList');
const roadmapEl = document.getElementById('roadmap');
const missableEl = document.getElementById('missableList');
const progressTextEl = document.getElementById('progressText');
const progressFillEl = document.getElementById('progressFill');
const progressSubEl = document.getElementById('progressSub');
const progressKindsEl = document.getElementById('progressKinds');
const progressLeftEl = document.getElementById('progressLeft');
const countLineEl = document.getElementById('countLine');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const earnedEl = document.getElementById('earnedFilter');
const spoilerEl = document.getElementById('spoilerToggle');

function readSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return;
    if (Array.isArray(raw.earned)) guide.earned = new Set(raw.earned.filter((n) => typeof n === 'string'));
    if (typeof raw.spoiler === 'boolean') guide.spoiler = raw.spoiler;
    if (typeof raw.kind === 'string') guide.kind = raw.kind;
    if (typeof raw.grade === 'string') guide.grade = raw.grade;
    if (typeof raw.earnedFilter === 'string') guide.earnedFilter = raw.earnedFilter;
  } catch {
    // A damaged save starts fresh instead of breaking the page.
  }
}

function writeSave() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    earned: [...guide.earned],
    spoiler: guide.spoiler,
    kind: guide.kind,
    grade: guide.grade,
    earnedFilter: guide.earnedFilter,
  }));
}

function concealed(trophy) {
  return guide.spoiler && trophy.hidden && !guide.earned.has(trophy.name);
}

function countEarned(predicate) {
  return guide.trophies.filter((t) => predicate(t) && guide.earned.has(t.name)).length;
}

function countTotal(predicate) {
  return guide.trophies.filter(predicate).length;
}

function paintProgress() {
  const earned = guide.earned.size;
  const total = guide.trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  progressTextEl.textContent = `${earned} of ${total} earned`;
  progressFillEl.style.width = `${pct}%`;
  progressSubEl.textContent = `Platinum ${countEarned((t) => t.grade === 'platinum')}/${countTotal((t) => t.grade === 'platinum')} · Gold ${countEarned((t) => t.grade === 'gold')}/${countTotal((t) => t.grade === 'gold')} · Silver ${countEarned((t) => t.grade === 'silver')}/${countTotal((t) => t.grade === 'silver')} · Bronze ${countEarned((t) => t.grade === 'bronze')}/${countTotal((t) => t.grade === 'bronze')}`;
  progressKindsEl.textContent = `Story ${countEarned((t) => t.kind === 'story')}/${countTotal((t) => t.kind === 'story')} · Collectibles ${countEarned((t) => t.kind === 'collectibles')}/${countTotal((t) => t.kind === 'collectibles')} · Activities ${countEarned((t) => t.kind === 'activities')}/${countTotal((t) => t.kind === 'activities')}`;
  progressLeftEl.textContent = earned === total
    ? 'Platinum earned — you are a Leonida Legend.'
    : `${total - earned} to go — the story comes first.`;
}

function paintMissable() {
  missableEl.replaceChildren();
  for (const trophy of guide.trophies.filter((t) => t.missable)) {
    const li = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = trophy.name;
    li.append(name, document.createTextNode(` — ${trophy.missableNote ?? trophy.description}`));
    missableEl.append(li);
  }
}

function paintRoadmap() {
  roadmapEl.replaceChildren();
  for (const stage of STAGES) {
    const members = guide.trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => guide.earned.has(t.name)).length;
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const head = document.createElement('div');
    head.className = 'roadmap-head';
    const title = document.createElement('h3');
    title.textContent = stage.title;
    const count = document.createElement('span');
    count.className = 'roadmap-count';
    count.textContent = `${done}/${members.length}`;
    head.append(title, count);
    const text = document.createElement('p');
    text.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'roadmap-chips';
    for (const trophy of members) {
      const chip = document.createElement('span');
      chip.className = `mini-chip grade-${trophy.grade}${guide.earned.has(trophy.name) ? ' done' : ''}`;
      chip.textContent = `${guide.earned.has(trophy.name) ? '✓ ' : ''}${trophy.name}`;
      chip.title = trophy.description;
      chips.append(chip);
    }
    li.append(head, text, chips);
    roadmapEl.append(li);
  }
}

function passes(trophy) {
  if (guide.kind === 'missable' && !trophy.missable) return false;
  if (guide.kind === 'online') return false;
  if (guide.kind !== 'all' && guide.kind !== 'missable' && trophy.kind !== guide.kind) return false;
  if (guide.grade !== 'all' && trophy.grade !== guide.grade) return false;
  const earned = guide.earned.has(trophy.name);
  if (guide.earnedFilter === 'earned' && !earned) return false;
  if (guide.earnedFilter === 'missing' && earned) return false;
  if (guide.search) {
    const hay = concealed(trophy) ? '' : `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(guide.search)) return false;
  }
  return true;
}

function cardFor(trophy) {
  const earned = guide.earned.has(trophy.name);
  const masked = concealed(trophy);
  const open = guide.openId === trophy.id;
  const card = document.createElement('article');
  card.className = `trophy-card grade-${trophy.grade}${earned ? ' earned' : ''}${masked ? ' masked' : ''}`;
  card.dataset.id = String(trophy.id);

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) guide.earned.add(trophy.name);
    else guide.earned.delete(trophy.name);
    writeSave();
    paintAll();
  });
  const titles = document.createElement('div');
  titles.className = 'trophy-titles';
  const name = document.createElement('h3');
  name.textContent = masked ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = masked ? 'Hidden until earned — turn spoiler-safe mode off to reveal it.' : trophy.description;
  titles.append(name, desc);
  const badges = document.createElement('div');
  badges.className = 'trophy-badges';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = `badge grade-${trophy.grade}`;
  gradeBadge.textContent = GRADE_NAMES[trophy.grade];
  badges.append(gradeBadge);
  const kindBadge = document.createElement('span');
  kindBadge.className = 'badge kind';
  kindBadge.textContent = KIND_NAMES[trophy.kind] ?? trophy.kind;
  badges.append(kindBadge);
  if (trophy.hidden) {
    const hiddenBadge = document.createElement('span');
    hiddenBadge.className = 'badge hidden-badge';
    hiddenBadge.textContent = 'Hidden';
    badges.append(hiddenBadge);
  }
  if (trophy.missable) {
    const flag = document.createElement('span');
    flag.className = 'badge missable-badge';
    flag.textContent = 'Missable';
    badges.append(flag);
  }
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  if (masked) {
    toggle.disabled = true;
    toggle.textContent = 'Guide hidden';
  } else {
    toggle.textContent = open ? 'Hide guide ▲' : 'Show guide ▼';
  }
  toggle.addEventListener('click', () => {
    guide.openId = open ? null : trophy.id;
    paintList();
  });
  head.append(box, titles, badges, toggle);
  card.append(head);

  if (open && !masked) {
    const detail = document.createElement('div');
    detail.className = 'trophy-guide';
    if (trophy.missableNote) {
      const warn = document.createElement('p');
      warn.className = 'missable-note';
      warn.textContent = `Missable: ${trophy.missableNote}`;
      detail.append(warn);
    }
    const guideText = document.createElement('p');
    guideText.textContent = trophy.guide;
    detail.append(guideText);
    const meta = document.createElement('p');
    meta.className = 'trophy-meta';
    meta.textContent = `Roadmap: ${STAGES.find((s) => s.stage === trophy.stage)?.title ?? ''} · Kind: ${KIND_NAMES[trophy.kind] ?? trophy.kind}`;
    detail.append(meta);
    const sources = document.createElement('p');
    sources.className = 'trophy-sources';
    sources.textContent = 'Sources: ';
    trophy.sources.forEach((source, index) => {
      if (index > 0) sources.append(document.createTextNode(' · '));
      const link = document.createElement('a');
      link.href = source.url;
      link.rel = 'noopener';
      link.textContent = source.name;
      sources.append(link);
    });
    detail.append(sources);
    card.append(detail);
  }
  return card;
}

function paintList() {
  listEl.replaceChildren();
  const shown = guide.trophies.filter(passes);
  if (guide.kind === 'online') {
    const empty = document.createElement('p');
    empty.className = 'empty-note';
    empty.textContent = 'No online trophies — GTA VI launched with single-player trophies only, and none of the 55 needs online play.';
    listEl.append(empty);
  }
  for (const trophy of shown) listEl.append(cardFor(trophy));
  countLineEl.textContent = guide.kind === 'online'
    ? 'Showing 0 of 55 trophies.'
    : `Showing ${shown.length} of ${guide.trophies.length} trophies.`;
}

function paintAll() {
  paintProgress();
  paintMissable();
  paintRoadmap();
  paintList();
}

function downloadProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedAt: new Date().toISOString(),
    earned: [...guide.earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function loadProgressFile(file) {
  const parsed = JSON.parse(await file.text());
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file does not hold a trophy list.');
  const known = new Set(guide.trophies.map((t) => t.name));
  const kept = names.filter((n) => typeof n === 'string' && known.has(n));
  guide.earned = new Set(kept);
  writeSave();
  paintAll();
}

function wireControls() {
  searchEl.addEventListener('input', () => {
    guide.search = searchEl.value.trim().toLowerCase();
    paintList();
  });
  gradeEl.addEventListener('change', () => {
    guide.grade = gradeEl.value;
    writeSave();
    paintList();
  });
  earnedEl.addEventListener('change', () => {
    guide.earnedFilter = earnedEl.value;
    writeSave();
    paintList();
  });
  spoilerEl.addEventListener('change', () => {
    guide.spoiler = spoilerEl.checked;
    writeSave();
    paintAll();
  });
  document.getElementById('kindChips').addEventListener('click', (event) => {
    const button = event.target.closest('[data-kind]');
    if (!button) return;
    guide.kind = button.dataset.kind;
    document.querySelectorAll('#kindChips .chip').forEach((chip) => {
      chip.classList.toggle('active', chip === button);
    });
    writeSave();
    paintList();
  });
  document.getElementById('exportBtn').addEventListener('click', downloadProgress);
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await loadProgressFile(file);
    } catch {
      alert('That file could not be imported as trophy progress.');
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all earned trophies? Export first if you want a backup.')) return;
    guide.earned = new Set();
    writeSave();
    paintAll();
  });
}

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  guide.trophies = doc.trophies;
}

readSave();
spoilerEl.checked = guide.spoiler;
gradeEl.value = guide.grade;
earnedEl.value = guide.earnedFilter;
document.querySelectorAll('#kindChips .chip').forEach((chip) => {
  chip.classList.toggle('active', chip.dataset.kind === guide.kind);
});
wireControls();
await loadTrophies();
paintAll();
