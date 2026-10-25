/* Entry point: navigation, progress, settings, and app start-up.
   index.html loads only this file; it imports the rest. */

import { $, paintIcons, difficultyHTML, copyText, toast } from './utils.js';
import { SCENARIOS, WEEK_MINUTES, SKILLS, HISTORY } from './data.js';
import { state } from './state.js';
import { renderGoal, renderDashboard } from './dashboard.js';
import { renderPicker, selectScenario, startSession, renderCoach } from './practice.js';
import { generateDraft, renderDraft, setPlatform } from './studio.js';
import { loadSaved, renderPhrasebook } from './phrasebook.js';

/* =========================================================
   4. NAVIGATION
   ========================================================= */
const TITLES = { dashboard: 'Dashboard', practice: 'Practice with a Client', studio: 'Message Studio', phrasebook: 'Phrasebook', progress: 'Progress', preferences: 'Settings' };

function showScreen(name) {
  state.screen = name;
  document.querySelectorAll('[data-screen]').forEach(s => { s.hidden = s.dataset.screen !== name; });
  document.querySelectorAll('.nav-item').forEach(b => {
    if (b.dataset.nav === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('#topTitle').textContent = TITLES[name];
  closeMenu();
  window.scrollTo({ top: 0 });
  if (name === 'dashboard') renderDashboard();
  if (name === 'phrasebook') renderPhrasebook();
  if (name === 'progress') renderProgress();
}

document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) { showScreen(nav.dataset.nav); return; }
  const start = e.target.closest('[data-start]');
  if (start) { selectScenario(start.dataset.start); showScreen('practice'); }
});

// Mobile drawer
function openMenu() { $('#sidebar').classList.add('open'); $('#scrim').hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true'); }
function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); }
$('#menuBtn').addEventListener('click', openMenu);
$('#scrim').addEventListener('click', closeMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

// Copy buttons on any screen (dashboard and phrasebook)
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]');
  if (c) copyText(c.dataset.copy);
});

/* =========================================================
   10. PROGRESS
   ========================================================= */
function renderProgress() {
  const max = 30;
  $('#bars').innerHTML = WEEK_MINUTES.map((m, i) => `
    <div class="bar ${i === 6 ? 'today' : ''} ${m === 0 ? 'zero' : ''}">
      <b>${m}</b><span style="height:${Math.max(2, (m / max) * 100)}%"></span>
    </div>`).join('');
  $('#skills').innerHTML = SKILLS.map(s => `
    <div class="skill"><div class="skill-top"><span>${s.name}</span><b>${s.score}</b></div>
    <div class="meter"><span style="width:${s.score}%"></span></div></div>`).join('');
  $('#history').innerHTML = HISTORY.map(h => {
    const s = SCENARIOS.find(x => x.id === h.id);
    const tagCls = h.score >= 80 ? 'tag-good' : h.score >= 60 ? '' : 'tag-warn';
    return `<tr><td class="num">${h.date}</td><td>${s.title}</td><td><span class="difficulty">${difficultyHTML(s.level)}</span></td><td class="num">${h.replies}</td><td><span class="tag ${tagCls}">${h.score}</span></td></tr>`;
  }).join('');
}

/* =========================================================
   11. SETTINGS
   ========================================================= */
$('#setGoal').addEventListener('input', (e) => { $('#setGoalOut').textContent = `${e.target.value} session${e.target.value === '1' ? '' : 's'}`; });
$('#settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.dailyGoal = Number($('#setGoal').value);
  state.showExplanations = $('#setExplain').checked;
  setPlatform($('#setPlatform').value);
  $('#toneSel').value = $('#setTone').value;
  try {
    localStorage.setItem('ccc-settings', JSON.stringify({ goal: state.dailyGoal, explain: state.showExplanations, platform: $('#setPlatform').value, tone: $('#setTone').value, level: $('#setLevel').value }));
  } catch (err) { /* storage blocked */ }
  renderGoal();
  renderCoach();
  toast('Settings saved in this browser');
});
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('ccc-settings') || 'null');
    if (!s) return;
    state.dailyGoal = s.goal; $('#setGoal').value = s.goal; $('#setGoalOut').textContent = `${s.goal} session${s.goal === 1 ? '' : 's'}`;
    state.showExplanations = s.explain; $('#setExplain').checked = s.explain;
    $('#setPlatform').value = s.platform; setPlatform(s.platform);
    $('#setTone').value = s.tone; $('#toneSel').value = s.tone;
    $('#setLevel').value = s.level;
  } catch (err) { /* use defaults */ }
}

/* =========================================================
   12. START THE APP
   ========================================================= */
paintIcons();
loadSaved();
loadSettings();
renderPicker();
startSession();
renderDraft();
generateDraft();      // show a sample draft so the studio isn't empty
showScreen('dashboard');
