// Leonida Trophy Guide — checklist, roadmap and tracker for the 55 GTA VI PS5 trophies.
// All data comes from data/trophies.json (official names, descriptions and grades plus this
// guide's own-word guides and sources). Progress is saved in localStorage; nothing is
// fetched from the network at run time except the local trophies.json file.

const SAVE_KEY = 'leonida-trophy-guide-progress-v1';
const DEMO_EARNED = [2, 3, 4, 5, 6, 8, 15, 16, 18, 20, 21, 32, 35, 42];

const ROADMAP = [
  {
    title: 'Stage 1 — Play the story (60–80 hours)',
    meta: 'Chapters 1–5 · 12 story trophies, all automatic',
    points: [
      'Finish Chapters 1–5 and the final mission. The 12 story trophies (Gone Fishing, the four chapter trophies, the final mission and the six named story missions) pop automatically — none can be missed.',
      'Do the Chapter 1 balcony meditation for Positive Mental Attitude before Chapter 1 ends: after the mission “Down to Earth”, talk to Lucia in the kitchen in the morning, follow her to the balcony and choose “Accept”. It is the only possibly missable trophy in the game.',
      'Scan vehicles with the WAiNK app and study animals with binoculars as you go — progress counts toward the 100% checklist later. Keep a save at the start and end of each chapter (15 manual save slots).',
    ],
  },
  {
    title: 'Stage 2 — Side characters and strangers',
    meta: '5 questlines + 8 Strangers & Freaks strands',
    points: [
      'Finish the five stranger questlines: Andy (Lucia only, Chapter 3), Kenton (treasure diving, 7 shipwrecks), Billy (Thrillbilly Mudclub), Randy (16 sports cars for his Wish List) and Tyrone (Jason only, destroy the Synthetic Labs).',
      'Complete 8 qualifying Strangers & Freaks strands — confirmed counters include Kirk (Skunk Ape), Kyle (McKittrick Farm), Yago (street racing) and Pilot Pete (deliveries).',
      'All of these stay available in free-roam after the story, so nothing here can be missed.',
    ],
  },
  {
    title: 'Stage 3 — 100% Completion checklist (~100 hours)',
    meta: 'Unlocks after the story: Progress > Stats > 100% Completion',
    points: [
      'The checklist is lenient (about 60% true completion): scan any 200 of 277 base-model vehicles, study any 100 of 255 animals, finish 300 stunts, any 70 of 80 challenges and any 100 optional missions.',
      'The only tasks that need everything: all robberies, all underwater discoveries, all 42 Shooting Range gold medals, all 14 Top Fun drone race locations, all 8 bank vaults, all 39 Illegal Gang Operations and all 15 Bret Target Decks.',
      'This stage pops A Long Road (gold) and, on the way, Cunning Stunts, The Shootist, Top Fun, Maximum Withdrawal, Pest Control, Fair Game, One Last Thing and Whip It Good.',
    ],
  },
  {
    title: 'Stage 4 — Cleanup and the platinum',
    meta: 'Miscellaneous trophies, then “Vice Got a Price!”',
    points: [
      'Mop up the miscellaneous trophies: the UFO easter egg (The Truth Is Out There), the bike-kick challenge (Ten Pin), the partner robberies (Hot Together, Retail Therapy), the money trophies (Dime on the Dollar, Treat Yo Self, Little Boxes) and vehicle registration (On the Spot).',
      'Check the list for anything left — most of it is one short session per trophy. When the 54th trophy pops, the platinum “Vice Got a Price!” follows at once.',
    ],
  },
];

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) ?? '[]'));
if (params.get('demo') === '1') {
  earned = new Set(DEMO_EARNED);
  localStorage.setItem(SAVE_KEY, JSON.stringify(DEMO_EARNED));
}

let kindFilter = params.get('filter') ?? 'all';
let gradeFilter = params.get('grade') ?? 'all';
let query = '';
let spoilerOn = params.get('spoiler') === '1';
let openId = params.get('open') ? Number(params.get('open')) : null;

const listEl = document.getElementById('list');
const countLine = document.getElementById('countLine');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeCounts = document.getElementById('gradeCounts');
const searchInput = document.getElementById('search');
const gradeSelect = document.getElementById('gradeFilter');
const spoilerToggle = document.getElementById('spoilerToggle');
const checklistView = document.getElementById('checklistView');
const roadmapView = document.getElementById('roadmapView');
const tabChecklist = document.getElementById('tabChecklist');
const tabRoadmap = document.getElementById('tabRoadmap');

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify([...earned]));
}

function isStory(t) {
  return t.kinds.includes('story');
}

function visibleName(t) {
  if (spoilerOn && isStory(t) && !earned.has(t.id)) return 'Hidden story trophy — earn it to reveal';
  return t.name;
}

function visibleDescription(t) {
  if (spoilerOn && isStory(t) && !earned.has(t.id)) return 'A story trophy. Its name and description stay hidden until you earn it.';
  return t.description;
}

function gradeBadge(t) {
  const span = document.createElement('span');
  span.className = 'badge ' + t.grade;
  span.textContent = t.grade;
  return span;
}

function trophyCard(t) {
  const card = document.createElement('article');
  card.className = 'card' + (earned.has(t.id) ? ' earned' : '');
  card.id = 'trophy-' + t.id;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Earned: ' + t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveProgress();
    renderAll();
  });

  const body = document.createElement('div');
  body.className = 'card-body';

  const top = document.createElement('div');
  top.className = 'card-top';
  const name = document.createElement('span');
  name.className = 'card-name';
  name.textContent = visibleName(t);
  top.append(name, gradeBadge(t));
  if (t.missable) {
    const miss = document.createElement('span');
    miss.className = 'badge missable';
    miss.textContent = 'Missable';
    top.append(miss);
  }
  if (t.hidden) {
    const hid = document.createElement('span');
    hid.className = 'badge hidden';
    hid.textContent = 'Hidden';
    top.append(hid);
  }

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = visibleDescription(t);

  body.append(top, desc);

  if (!(spoilerOn && isStory(t) && !earned.has(t.id))) {
    const guide = document.createElement('details');
    guide.className = 'card-guide';
    if (openId === t.id) guide.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'How to get it';
    const text = document.createElement('p');
    text.textContent = t.guide;
    const source = document.createElement('p');
    source.className = 'card-source';
    source.textContent = 'Source: ';
    const link = document.createElement('a');
    link.href = t.source_url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = t.source;
    source.append(link);
    guide.append(summary, text, source);
    body.append(guide);
  } else {
    const note = document.createElement('p');
    note.className = 'spoiler-hidden';
    note.textContent = 'Guide hidden with spoilers — earn this trophy (or turn spoilers off) to see it.';
    body.append(note);
  }

  card.append(box, body);
  return card;
}

function filteredTrophies() {
  return trophies.filter((t) => {
    if (kindFilter !== 'all' && !t.kinds.includes(kindFilter)) return false;
    if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
    if (query) {
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  progressText.textContent = done + ' of ' + total + ' earned';
  progressPct.textContent = pct + '%';
  progressFill.style.width = pct + '%';
  const byGrade = {};
  for (const t of trophies) {
    if (earned.has(t.id)) byGrade[t.grade] = (byGrade[t.grade] || 0) + 1;
  }
  const totals = {};
  for (const t of trophies) totals[t.grade] = (totals[t.grade] || 0) + 1;
  gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => g + ' ' + (byGrade[g] || 0) + '/' + totals[g])
    .join(' · ');
}

function renderList() {
  const shown = filteredTrophies();
  listEl.replaceChildren();
  for (const t of shown) listEl.append(trophyCard(t));
  countLine.textContent = shown.length + ' of ' + trophies.length + ' trophies shown'
    + (kindFilter !== 'all' ? ' · filter: ' + kindFilter : '')
    + (gradeFilter !== 'all' ? ' · grade: ' + gradeFilter : '')
    + (query ? ' · search: “' + query + '”' : '');
}

function renderRoadmap() {
  const host = document.getElementById('roadmapStages');
  host.replaceChildren();
  for (const stage of ROADMAP) {
    const div = document.createElement('div');
    div.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const meta = document.createElement('p');
    meta.className = 'stage-meta';
    meta.textContent = stage.meta;
    const ul = document.createElement('ul');
    for (const point of stage.points) {
      const li = document.createElement('li');
      li.textContent = point;
      ul.append(li);
    }
    div.append(h, meta, ul);
    host.append(div);
  }
}

function renderAll() {
  renderProgress();
  renderList();
}

function showView(view) {
  const roadmap = view === 'roadmap';
  roadmapView.hidden = !roadmap;
  checklistView.hidden = roadmap;
  document.getElementById('missableBanner').hidden = roadmap;
  tabRoadmap.classList.toggle('active', roadmap);
  tabChecklist.classList.toggle('active', !roadmap);
}

function setKind(kind) {
  kindFilter = kind;
  document.querySelectorAll('#kindFilters .kind').forEach((b) => {
    b.classList.toggle('active', b.dataset.kind === kind);
  });
  renderList();
}

document.querySelectorAll('#kindFilters .kind').forEach((b) => {
  b.classList.toggle('active', b.dataset.kind === kindFilter);
  b.addEventListener('click', () => setKind(b.dataset.kind));
});
gradeSelect.value = gradeFilter;
gradeSelect.addEventListener('change', () => {
  gradeFilter = gradeSelect.value;
  renderList();
});
searchInput.addEventListener('input', () => {
  query = searchInput.value.trim().toLowerCase();
  renderList();
});
spoilerToggle.checked = spoilerOn;
spoilerToggle.addEventListener('change', () => {
  spoilerOn = spoilerToggle.checked;
  renderList();
});
document.getElementById('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: doc.game, earned: [...earned].sort((x, y) => x - y) })], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(Number(id))).map(Number));
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a valid progress export.');
  }
  e.target.value = '';
});
document.getElementById('missableJump').addEventListener('click', () => {
  setKind('missable');
  openId = 28;
  renderList();
  document.getElementById('trophy-28')?.scrollIntoView({ block: 'start' });
});
tabChecklist.addEventListener('click', () => showView('list'));
tabRoadmap.addEventListener('click', () => showView('roadmap'));

renderRoadmap();
renderAll();
showView(params.get('view') === 'roadmap' ? 'roadmap' : 'list');
function scrollToTrophyIfOffscreen(id) {
  const el = document.getElementById('trophy-' + id);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (rect.top < 0 || rect.top > innerHeight) el.scrollIntoView({ block: 'start' });
}
if (openId) scrollToTrophyIfOffscreen(openId);
