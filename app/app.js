// Leonida Legend — GTA VI trophy guide and tracker.
// Loads app/data/trophies.json, renders the checklist, the platinum roadmap and
// the missable list, and keeps progress in localStorage with export and import.
const STORAGE_KEY = 'leonida-legend-progress-v1';
const ROADMAP_STAGES = [
  { stage: 1, title: 'Stage 1 — Play the story', text: 'Chapters 1 to 4 and the final mission. Do Lucia’s balcony meditation in Chapter 1 before the chapter ends, rob Kingpin Bowling in Chapter 2, and keep a manual save at the start of every chapter.' },
  { stage: 2, title: 'Stage 2 — Side stories and strangers', text: 'The six side-story finales and the 8 stranger strands. Do the Race Against Yago in Chapter 3 the moment it appears — it is time-sensitive and counts toward Strangers & Freaks.' },
  { stage: 3, title: 'Stage 3 — Partner and robbery one-offs', text: 'Partner trophies with Jason and Lucia together, the robbery set, the airport plane, the tank and the hidden one-offs. Bring your partner to the bank vaults: you cannot carry all the bags alone.' },
  { stage: 4, title: 'Stage 4 — Collectibles and the long grind', text: 'Cards, WAiNK spots, vehicles, garages, stunts, Challenges, races and the shooting ranges. Scan traffic with WAiNK as you drive and keep going past each trophy’s count: 100% needs more of everything.' },
  { stage: 5, title: 'Stage 5 — 100% cleanup and the platinum', text: 'The 100% checklist appears after the story under Progress, Stats, 100% Completion. Finish it for A Long Road, and Vice Got a Price! pops with it.' },
];
const KIND_LABELS = { story: 'Story', collectibles: 'Collectibles', activities: 'Activities' };
const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

const state = {
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
const progressLeftEl = document.getElementById('progressLeft');
const countLineEl = document.getElementById('countLine');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const earnedEl = document.getElementById('earnedFilter');
const spoilerEl = document.getElementById('spoilerToggle');

function loadStoredState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!raw || typeof raw !== 'object') return;
    if (Array.isArray(raw.earned)) state.earned = new Set(raw.earned.filter((n) => typeof n === 'string'));
    if (typeof raw.spoiler === 'boolean') state.spoiler = raw.spoiler;
    if (typeof raw.kind === 'string') state.kind = raw.kind;
    if (typeof raw.grade === 'string') state.grade = raw.grade;
    if (typeof raw.earnedFilter === 'string') state.earnedFilter = raw.earnedFilter;
  } catch {
    // A corrupt save starts fresh rather than breaking the page.
  }
}

function saveStoredState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    earned: [...state.earned],
    spoiler: state.spoiler,
    kind: state.kind,
    grade: state.grade,
    earnedFilter: state.earnedFilter,
  }));
}

function isMasked(trophy) {
  return state.spoiler && trophy.hidden && !state.earned.has(trophy.name);
}

function gradeCount(grade) {
  return state.trophies.filter((t) => t.grade === grade && state.earned.has(t.name)).length;
}

function gradeTotal(grade) {
  return state.trophies.filter((t) => t.grade === grade).length;
}

function renderProgress() {
  const earned = state.earned.size;
  const total = state.trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  progressTextEl.textContent = `${earned} of ${total} earned`;
  progressFillEl.style.width = `${pct}%`;
  progressSubEl.textContent = `Platinum ${gradeCount('platinum')}/${gradeTotal('platinum')} · Gold ${gradeCount('gold')}/${gradeTotal('gold')} · Silver ${gradeCount('silver')}/${gradeTotal('silver')} · Bronze ${gradeCount('bronze')}/${gradeTotal('bronze')}`;
  progressLeftEl.textContent = earned === total
    ? 'Platinum earned — you are a Leonida Legend.'
    : `${total - earned} to go — start with the story.`;
}

function renderMissable() {
  missableEl.replaceChildren();
  for (const trophy of state.trophies.filter((t) => t.missable)) {
    const li = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = trophy.name;
    li.append(name, document.createTextNode(` — ${trophy.missableNote ?? trophy.description}`));
    missableEl.append(li);
  }
}

function renderRoadmap() {
  roadmapEl.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const members = state.trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => state.earned.has(t.name)).length;
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
      chip.className = `mini-chip grade-${trophy.grade}${state.earned.has(trophy.name) ? ' done' : ''}`;
      chip.textContent = `${state.earned.has(trophy.name) ? '✓ ' : ''}${trophy.name}`;
      chip.title = trophy.description;
      chips.append(chip);
    }
    li.append(head, text, chips);
    roadmapEl.append(li);
  }
}

function matchesFilters(trophy) {
  if (state.kind === 'missable' && !trophy.missable) return false;
  if (state.kind === 'online') return false;
  if (state.kind !== 'all' && state.kind !== 'missable' && trophy.kind !== state.kind) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  const earned = state.earned.has(trophy.name);
  if (state.earnedFilter === 'earned' && !earned) return false;
  if (state.earnedFilter === 'missing' && earned) return false;
  if (state.search) {
    const hay = isMasked(trophy) ? '' : `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
    if (!hay.includes(state.search)) return false;
  }
  return true;
}

function trophyCard(trophy) {
  const earned = state.earned.has(trophy.name);
  const masked = isMasked(trophy);
  const open = state.openId === trophy.id;
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
    if (box.checked) state.earned.add(trophy.name);
    else state.earned.delete(trophy.name);
    saveStoredState();
    renderAll();
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
  const grade = document.createElement('span');
  grade.className = `badge grade-${trophy.grade}`;
  grade.textContent = GRADE_LABELS[trophy.grade];
  badges.append(grade);
  const kind = document.createElement('span');
  kind.className = 'badge kind';
  kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  badges.append(kind);
  if (trophy.hidden) {
    const hidden = document.createElement('span');
    hidden.className = 'badge hidden-badge';
    hidden.textContent = 'Hidden';
    badges.append(hidden);
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
    state.openId = open ? null : trophy.id;
    renderList();
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
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    detail.append(guide);
    const meta = document.createElement('p');
    meta.className = 'trophy-meta';
    meta.textContent = `Roadmap: ${ROADMAP_STAGES.find((s) => s.stage === trophy.stage)?.title ?? ''} · Kind: ${KIND_LABELS[trophy.kind] ?? trophy.kind}`;
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

function renderList() {
  listEl.replaceChildren();
  const shown = state.trophies.filter(matchesFilters);
  if (state.kind === 'online') {
    const empty = document.createElement('p');
    empty.className = 'empty-note';
    empty.textContent = 'No online trophies — GTA VI launched with single-player trophies only, and none of the 55 needs online play.';
    listEl.append(empty);
  }
  for (const trophy of shown) listEl.append(trophyCard(trophy));
  countLineEl.textContent = state.kind === 'online'
    ? 'Showing 0 of 55 trophies.'
    : `Showing ${shown.length} of ${state.trophies.length} trophies.`;
}

function renderAll() {
  renderProgress();
  renderMissable();
  renderRoadmap();
  renderList();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('That file does not hold a trophy list.');
  const known = new Set(state.trophies.map((t) => t.name));
  const kept = names.filter((n) => typeof n === 'string' && known.has(n));
  state.earned = new Set(kept);
  saveStoredState();
  renderAll();
}

function bindControls() {
  searchEl.addEventListener('input', () => {
    state.search = searchEl.value.trim().toLowerCase();
    renderList();
  });
  gradeEl.addEventListener('change', () => {
    state.grade = gradeEl.value;
    saveStoredState();
    renderList();
  });
  earnedEl.addEventListener('change', () => {
    state.earnedFilter = earnedEl.value;
    saveStoredState();
    renderList();
  });
  spoilerEl.addEventListener('change', () => {
    state.spoiler = spoilerEl.checked;
    saveStoredState();
    renderAll();
  });
  document.getElementById('kindChips').addEventListener('click', (event) => {
    const button = event.target.closest('[data-kind]');
    if (!button) return;
    state.kind = button.dataset.kind;
    document.querySelectorAll('#kindChips .chip').forEach((chip) => {
      chip.classList.toggle('active', chip === button);
    });
    saveStoredState();
    renderList();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await importProgress(file);
    } catch {
      alert('That file could not be imported as trophy progress.');
    }
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all earned trophies? Export first if you want a backup.')) return;
    state.earned = new Set();
    saveStoredState();
    renderAll();
  });
}

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  state.trophies = doc.trophies;
}

loadStoredState();
spoilerEl.checked = state.spoiler;
gradeEl.value = state.grade;
earnedEl.value = state.earnedFilter;
document.querySelectorAll('#kindChips .chip').forEach((chip) => {
  chip.classList.toggle('active', chip.dataset.kind === state.kind);
});
bindControls();
await loadTrophies();
renderAll();
