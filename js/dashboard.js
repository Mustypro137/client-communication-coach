import { $, icon, escapeHTML, difficultyHTML } from './utils.js';
import { SCENARIOS, PHRASES } from './data.js';
import { state } from './state.js';
import { getSessions, dayKey, sessionsOn, streak, lastNDays, average, latestFor, recommend } from './progress.js';

/* =========================================================
   6. DASHBOARD
   ========================================================= */
export function renderGoal() {
  const today = sessionsOn(getSessions(), dayKey());
  const done = Math.min(today, state.dailyGoal);
  const circumference = 2 * Math.PI * 36;
  $('#goalArc').setAttribute('stroke-dashoffset', String(circumference * (1 - done / state.dailyGoal)));
  $('#goalNum').textContent = `${done}/${state.dailyGoal}`;
  $('#goalChip').textContent = `${done} of ${state.dailyGoal} today`;
  const complete = done >= state.dailyGoal;
  $('#goalTag').textContent = complete ? 'Completed' : 'In progress';
  $('#goalTag').className = 'tag ' + (complete ? 'tag-good' : '');
  const items = ['Practise one client conversation', 'Fix the English the coach suggests', 'Save one new phrase'];
  const doneFlags = [today >= 1, today >= 2, state.saved.size > 0];
  $('#goalList').innerHTML = items.map((t, i) => `<li class="${doneFlags[i] ? 'done' : ''}"><span class="check">${doneFlags[i] ? icon('check', 12) : ''}</span>${t}</li>`).join('');

  const days = streak(getSessions());
  $('#streakText').textContent = days ? `${days}-day streak` : 'Start a streak';
}

export function renderDashboard() {
  renderGoal();
  const all = getSessions();
  $('#heroDay').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long' }) + ' practice';

  // Stats
  $('#statSessions').textContent = lastNDays(all, 7).length;
  const avg = average(all.map(s => s.score));
  $('#statAvg').innerHTML = avg === null ? '–' : `${avg}<small>/100</small>`;
  $('#statAvgNote').textContent = avg === null ? 'Send a practice reply to get a score' : `Across ${all.length} session${all.length === 1 ? '' : 's'}`;
  $('#statSaved').textContent = state.saved.size;

  // Recent scenarios, with your latest score for each
  $('#recentList').innerHTML = SCENARIOS.map(s => {
    const last = latestFor(all, s.id);
    return `
    <li class="scenario-row">
      <div class="client-avatar" style="--avatar-bg:${s.avatarBg}">${s.initials}</div>
      <div style="min-width:0">
        <div class="title">${s.title}</div>
        <div class="meta"><span>${s.client}</span><span class="difficulty">${difficultyHTML(s.level)}</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        ${last ? `<span class="score-pill" title="Last score">${last.score}</span>` : '<span class="tag">New</span>'}
        <button class="btn btn-secondary btn-sm" data-start="${s.id}">${last ? 'Retry' : 'Start'}</button>
      </div>
    </li>`;
  }).join('');

  // Next recommended exercise
  const next = recommend(all);
  $('#nextTitle').textContent = next.scenario.title;
  $('#nextText').textContent = next.score === null
    ? `You haven't tried this one yet. ${next.scenario.objective}`
    : `Your last score here was ${next.score}, your lowest so far. Try it again and aim higher.`;
  $('#nextBtn').dataset.start = next.scenario.id;

  const picks = [PHRASES[4], PHRASES[17], PHRASES[6]];
  $('#dashPhrases').innerHTML = picks.map(p => `
    <li><div><q>${p.text}</q><small>${p.mean}</small></div>
    <button class="icon-btn" aria-label="Copy phrase" data-copy="${escapeHTML(p.text)}">${icon('copy', 15)}</button></li>`).join('');
}
