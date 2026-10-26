import { $, icon, escapeHTML, difficultyHTML } from './utils.js';
import { SCENARIOS } from './data.js';

/* =========================================================
   10. PROGRESS — your real practice, saved in this browser
   ========================================================= */
// One saved session looks like:
// { id, date: '2026-10-25', scenarioId, replies, score, minutes, skills: { tone, questions, english, tricky },
//   mistakes: [{ wrong: 'informations', right: 'information' }, { rule: 'capital' }] }
// (Sessions saved before "mistakes" was added don't have it.)
const KEY = 'ccc-progress';
let sessions = load();

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{"sessions":[]}').sessions || []; }
  catch (e) { return []; } // storage blocked or broken: start empty
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ sessions })); } catch (e) { /* storage blocked */ }
}

export function getSessions() { return sessions; }

/* Save a session, or update it if it already exists (called after every reply) */
export function recordSession(session) {
  const i = sessions.findIndex(s => s.id === session.id);
  if (i === -1) sessions.push(session); else sessions[i] = session;
  save();
}
export function resetProgress() { sessions = []; save(); }

/* ---------- Dates ---------- */
// A day as 'YYYY-MM-DD' in your own time zone
export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function daysAgo(n, from) {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return d;
}

/* ---------- Calculations (each takes the list, so they are easy to test) ---------- */
export function sessionsOn(list, day) { return list.filter(s => s.date === day).length; }

// Days in a row with practice. Practising yesterday but not yet today still counts.
export function streak(list, today = new Date()) {
  const days = new Set(list.map(s => s.date));
  const first = days.has(dayKey(today)) ? 0 : 1;
  let n = 0;
  while (days.has(dayKey(daysAgo(first + n, today)))) n++;
  return n;
}

// Sessions from the last n days, including today
export function lastNDays(list, n, today = new Date()) {
  const keys = new Set();
  for (let i = 0; i < n; i++) keys.add(dayKey(daysAgo(i, today)));
  return list.filter(s => keys.has(s.date));
}

// Rounded average, or null when there is nothing to average
export function average(nums) {
  return nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;
}

// Practice minutes for each day of this week, Monday to Sunday
export function weekMinutes(list, today = new Date()) {
  const monday = daysAgo((today.getDay() + 6) % 7, today);
  return [0, 1, 2, 3, 4, 5, 6].map(i => {
    const key = dayKey(daysAgo(-i, monday));
    return list.filter(s => s.date === key).reduce((sum, s) => sum + s.minutes, 0);
  });
}

// Your most recent session for one scenario, or null
export function latestFor(list, scenarioId) {
  return list.filter(s => s.scenarioId === scenarioId).pop() || null;
}

// Next exercise: a scenario you haven't tried yet, otherwise your lowest latest score
export function recommend(list) {
  const untried = SCENARIOS.find(s => !latestFor(list, s.id));
  if (untried) return { scenario: untried, score: null };
  const scored = SCENARIOS.map(s => ({ scenario: s, score: latestFor(list, s.id).score }));
  return scored.reduce((low, x) => (x.score < low.score ? x : low));
}

/* ---------- Your common mistakes ---------- */
// The coach's corrections -> what is saved. Only the short mistake and its fix are kept,
// never your reply. Capital letter and full stop: their text is a piece of your reply, so only the rule.
export function mistakesToSave(english) {
  return english.map(e => e.rule ? { rule: e.rule } : { wrong: e.wrong, right: e.right });
}

const RULE_NAMES = { capital: 'Capital letter at the start', ending: 'Full stop or ? at the end' };

// Your n most frequent mistakes in all sessions: [{ wrong, right, label, count }], most frequent first
export function commonMistakes(list, n = 5) {
  const counts = new Map(); // one entry per kind of mistake
  for (const s of list) {
    for (const m of s.mistakes || []) {
      const key = m.rule || `${m.wrong.toLowerCase()}→${m.right.toLowerCase()}`;
      if (!counts.has(key)) counts.set(key, { wrong: m.wrong, right: m.right, label: RULE_NAMES[m.rule], count: 0 });
      counts.get(key).count++;
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, n);
}

export const SKILL_NAMES = {
  tone: 'Professional tone',
  questions: 'Asking good questions',
  english: 'Clear English',
  tricky: 'Handling tricky moments'
};

/* ---------- Progress screen ---------- */
export function renderProgress() {
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const minutes = weekMinutes(sessions);
  const max = Math.max(30, ...minutes);
  $('#weekTotal').textContent = `${minutes.reduce((a, b) => a + b, 0)} min total`;
  $('#bars').innerHTML = minutes.map((m, i) => `
    <div class="bar ${i === todayIndex ? 'today' : ''} ${m === 0 ? 'zero' : ''}">
      <b>${m}</b><span style="height:${Math.max(2, (m / max) * 100)}%"></span>
    </div>`).join('');

  $('#skills').innerHTML = sessions.length
    ? Object.keys(SKILL_NAMES).map(key => {
        const score = average(sessions.map(s => s.skills[key]));
        return `<div class="skill"><div class="skill-top"><span>${SKILL_NAMES[key]}</span><b>${score}</b></div>
        <div class="meter"><span style="width:${score}%"></span></div></div>`;
      }).join('')
    : '<p class="muted">Your skill scores appear after your first practice reply.</p>';

  const mistakes = commonMistakes(sessions);
  $('#mistakes').innerHTML = mistakes.length
    ? mistakes.map(m => `<li class="mistake">${m.label
        ? `<span>${m.label}</span>`
        : `<span class="pair"><del>${escapeHTML(m.wrong)}</del>${icon('arrow', 13)}<ins>${escapeHTML(m.right)}</ins></span>`}
        <b class="mono">×${m.count}</b></li>`).join('')
    : '<li class="muted">No mistakes saved yet. They appear after you practise.</li>';

  // Total mistakes in all sessions (old sessions have no list, so count them as 0)
  const total = sessions.reduce((sum, s) => sum + (s.mistakes || []).length, 0);
  const withMistakes = sessions.filter(s => (s.mistakes || []).length > 0).length;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`; // 1 mistake, 2 mistakes
  $('#mistakeTotal').textContent = total > 0
    ? `${plural(total, 'mistake')} found in ${plural(withMistakes, 'session')}.`
    : '';

  const recent = sessions.slice(-10).reverse();
  $('#history').innerHTML = recent.length
    ? recent.map(h => {
        const s = SCENARIOS.find(x => x.id === h.scenarioId);
        if (!s) return ''; // a scenario that no longer exists
        const [y, m, d] = h.date.split('-').map(Number);
        const date = new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        const tagCls = h.score >= 80 ? 'tag-good' : h.score >= 60 ? '' : 'tag-warn';
        return `<tr><td class="num">${date}</td><td>${s.title}</td><td><span class="difficulty">${difficultyHTML(s.level)}</span></td><td class="num">${h.replies}</td><td><span class="tag ${tagCls}">${h.score}</span></td></tr>`;
      }).join('')
    : '<tr><td colspan="5">No practice yet. <button class="link-btn" data-nav="practice">Start your first scenario</button></td></tr>';
}
