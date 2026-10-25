import { $, icon, escapeHTML, difficultyHTML } from './utils.js';
import { SCENARIOS } from './data.js';
import { state } from './state.js';
import { getSessions, latestFor } from './progress.js';

/* =========================================================
   SCENARIO LIBRARY — all scenarios, filtered by level and status
   ========================================================= */
const LEVELS = [
  { id: 'all', label: 'All levels' },
  { id: 1, label: 'Beginner' },
  { id: 2, label: 'Intermediate' },
  { id: 3, label: 'Advanced' }
];
const STATUSES = [
  { id: 'all', label: 'Any status' },
  { id: 'new', label: 'New' },
  { id: 'done', label: 'Practised' }
];

// One row of filter buttons. "pressed" shows which one is chosen.
function chips(list, current, attr) {
  return list.map(c => `<button class="cat" ${attr}="${c.id}" aria-pressed="${String(c.id) === String(current)}">${c.label}</button>`).join('');
}

export function renderLibrary() {
  const all = getSessions();
  const { level, status } = state.lib;
  $('#libLevel').innerHTML = chips(LEVELS, level, 'data-lib-level');
  $('#libStatus').innerHTML = chips(STATUSES, status, 'data-lib-status');

  const list = SCENARIOS.filter(s => {
    const last = latestFor(all, s.id);
    const levelOk = level === 'all' || s.level === level;
    const statusOk = status === 'all' || (status === 'new' ? !last : !!last);
    return levelOk && statusOk;
  });
  $('#libCount').textContent = `Showing ${list.length} of ${SCENARIOS.length} scenarios`;

  if (!list.length) {
    $('#libGrid').innerHTML = `<div class="empty">${icon('search', 26)}<h3>No scenarios match these filters</h3>
      <p>${status === 'new' ? "You've tried every scenario at this level. Well done!" : 'Try another level.'}</p>
      <button class="btn btn-secondary btn-sm" data-lib-reset>Show all scenarios</button></div>`;
    return;
  }

  $('#libGrid').innerHTML = list.map(s => {
    const last = latestFor(all, s.id);
    return `<article class="card lib-card">
      <div class="lib-client">
        <div class="client-avatar" style="--avatar-bg:${s.avatarBg}">${s.initials}</div>
        <div class="who"><strong>${escapeHTML(s.client)}</strong><span>${escapeHTML(s.role)}</span></div>
      </div>
      <h2>${escapeHTML(s.title)}</h2>
      <p>${escapeHTML(s.objective)}</p>
      <div class="lib-meta">
        <span class="difficulty">${difficultyHTML(s.level)}</span>
        <span class="tag">${escapeHTML(s.skill)}</span>
      </div>
      <div class="lib-foot">
        ${last ? `<span class="muted">Last score <span class="score-pill">${last.score}</span></span>` : '<span class="tag">New</span>'}
        <button class="btn btn-secondary btn-sm" data-start="${s.id}">${last ? 'Practise again' : 'Start'} ${icon('arrow', 15)}</button>
      </div>
    </article>`;
  }).join('');
}

// Filter clicks. Levels are numbers in data.js, so convert them back from text.
$('#libLevel').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lib-level]');
  if (!b) return;
  const v = b.dataset.libLevel;
  state.lib.level = v === 'all' ? 'all' : Number(v);
  renderLibrary();
});
$('#libStatus').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lib-status]');
  if (!b) return;
  state.lib.status = b.dataset.libStatus;
  renderLibrary();
});
$('#libGrid').addEventListener('click', (e) => {
  if (!e.target.closest('[data-lib-reset]')) return;
  state.lib = { level: 'all', status: 'all' };
  renderLibrary();
});
