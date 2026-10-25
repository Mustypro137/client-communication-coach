import { $, icon, escapeHTML, copyText } from './utils.js';
import { SCENARIOS } from './data.js';
import { state } from './state.js';
import { getSessions, recommend, SKILL_NAMES } from './progress.js';
import { scoreLabel } from './practice.js';

/* =========================================================
   SESSION RESULTS — the summary you see after "End session"
   Uses the coach's feedback on your last reply (state.feedback)
   and your saved sessions. Nothing new is stored.
   ========================================================= */
export function renderResults() {
  const s = SCENARIOS.find(x => x.id === state.scenarioId);
  const f = state.feedback;
  const firstName = s.client.split(' ')[0];

  $('#resultsIntro').textContent = `${s.title} · with ${s.client}. Based on the coach's feedback on your last reply.`;

  // Compare with your previous session in this scenario (not this one)
  const before = getSessions().filter(x => x.scenarioId === s.id && x.id !== state.sessionId).pop();
  let compare = 'Your first try at this scenario';
  if (before) {
    const diff = f.score - before.score;
    compare = `Last time: ${before.score} (${diff > 0 ? '+' : ''}${diff})`;
  }
  const minutes = Math.max(1, Math.round((Date.now() - state.sessionStart) / 60000));
  $('#resultStats').innerHTML = `
    <div class="card stat"><span class="eyebrow">Score</span><div class="stat-value">${f.score}<small>/100</small></div><p class="stat-note"><strong>${scoreLabel(f.score)}</strong> · ${compare}</p></div>
    <div class="card stat"><span class="eyebrow">Replies</span><div class="stat-value">${state.replyCount}</div><p class="stat-note">Messages you sent to ${escapeHTML(firstName)}</p></div>
    <div class="card stat"><span class="eyebrow">Practice time</span><div class="stat-value">${minutes}<small>min</small></div><p class="stat-note">Added to your progress</p></div>`;

  // Top 3 things to fix: professional tips first, then forgotten topics, then English
  const fixes = [
    ...f.prof.filter(p => p.type === 'tip').map(p => p.text),
    ...f.forgotten.map(label => `Ask about: ${label.charAt(0).toLowerCase() + label.slice(1)}.`),
    ...f.english.map(e => `Write "${e.right}" instead of "${e.wrong}".`)
  ].slice(0, 3);
  $('#resultFixes').innerHTML = fixes.length
    ? fixes.map(t => `<li class="tip">${icon('alert', 15)}<span>${escapeHTML(t)}</span></li>`).join('')
    : `<li class="good">${icon('check', 15)}<span>Nothing big to fix. Try a harder scenario next.</span></li>`;
  $('#resultGood').innerHTML = f.good.map(t => `<li class="good">${icon('check', 15)}<span>${escapeHTML(t)}</span></li>`).join('');

  // The same skill bars as the Progress screen
  $('#resultSkills').innerHTML = Object.keys(SKILL_NAMES).map(key => `
    <div class="skill"><div class="skill-top"><span>${SKILL_NAMES[key]}</span><b>${f.skills[key]}</b></div>
    <div class="meter"><span style="width:${f.skills[key]}%"></span></div></div>`).join('');

  $('#resultModel').textContent = f.model;
  $('#resultCopy').onclick = () => copyText(f.model);

  // One main button: the recommended next scenario (or this one again, if it is the recommendation)
  const next = recommend(getSessions()).scenario;
  const again = `<button class="btn ${next.id === s.id ? 'btn-primary' : 'btn-secondary'}" data-start="${s.id}">${icon('restart', 16)}Practise this again</button>`;
  const nextBtn = next.id === s.id ? '' : `<button class="btn btn-primary" data-start="${next.id}">Next: ${escapeHTML(next.title)} ${icon('arrow', 16)}</button>`;
  $('#resultActions').innerHTML = nextBtn + again + `<button class="btn btn-ghost" data-nav="dashboard">Back to dashboard</button>`;
}
