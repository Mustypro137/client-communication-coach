import { $, icon, escapeHTML, difficultyHTML } from './utils.js';
import { SCENARIOS, PHRASES } from './data.js';
import { state } from './state.js';

/* =========================================================
   6. DASHBOARD
   ========================================================= */
export function renderGoal() {
  const done = Math.min(state.sessionsToday, state.dailyGoal);
  const circumference = 2 * Math.PI * 36;
  $('#goalArc').setAttribute('stroke-dashoffset', String(circumference * (1 - done / state.dailyGoal)));
  $('#goalNum').textContent = `${done}/${state.dailyGoal}`;
  $('#goalChip').textContent = `${done} of ${state.dailyGoal} today`;
  const complete = done >= state.dailyGoal;
  $('#goalTag').textContent = complete ? 'Completed' : 'In progress';
  $('#goalTag').className = 'tag ' + (complete ? 'tag-good' : '');
  const items = ['Practise one client conversation', 'Fix the English the coach suggests', 'Save one new phrase'];
  const doneFlags = [state.sessionsToday >= 1, state.sessionsToday >= 2, state.saved.size > 0];
  $('#goalList').innerHTML = items.map((t, i) => `<li class="${doneFlags[i] ? 'done' : ''}"><span class="check">${doneFlags[i] ? icon('check', 12) : ''}</span>${t}</li>`).join('');
}

export function renderDashboard() {
  renderGoal();
  $('#statSaved').textContent = state.saved.size;
  $('#recentList').innerHTML = SCENARIOS.map(s => `
    <li class="scenario-row">
      <div class="client-avatar" style="--avatar-bg:${s.avatarBg}">${s.initials}</div>
      <div style="min-width:0">
        <div class="title">${s.title}</div>
        <div class="meta"><span>${s.client}</span><span class="difficulty">${difficultyHTML(s.level)}</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        ${s.lastScore ? `<span class="score-pill" title="Last score">${s.lastScore}</span>` : '<span class="tag">New</span>'}
        <button class="btn btn-secondary btn-sm" data-start="${s.id}">${s.lastScore ? 'Retry' : 'Start'}</button>
      </div>
    </li>`).join('');
  const picks = [PHRASES[4], PHRASES[17], PHRASES[6]];
  $('#dashPhrases').innerHTML = picks.map(p => `
    <li><div><q>${p.text}</q><small>${p.mean}</small></div>
    <button class="icon-btn" aria-label="Copy phrase" data-copy="${escapeHTML(p.text)}">${icon('copy', 15)}</button></li>`).join('');
}
