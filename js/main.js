/* Entry point: navigation, progress, settings, and app start-up.
   app.html loads only this file; it imports the rest. */

import { $, paintIcons, copyText, toast } from './utils.js';
import { state } from './state.js';
import { renderProgress, resetProgress } from './progress.js';
import { renderGoal, renderDashboard } from './dashboard.js';
import { renderPicker, selectScenario, startSession, renderCoach, endSession } from './practice.js';
import { renderResults } from './results.js';
import { renderLibrary } from './library.js';
import { generateDraft, renderDraft, setPlatform } from './studio.js';
import { loadSaved, renderPhrasebook } from './phrasebook.js';
import './pwa.js'; // offline mode: registers the service worker (sw.js)

/* =========================================================
   4. NAVIGATION
   ========================================================= */
const TITLES = { dashboard: 'Dashboard', practice: 'Practice with a Client', library: 'Scenario library', studio: 'Message Studio', phrasebook: 'Phrasebook', progress: 'Progress', preferences: 'Settings', results: 'Session results' };

function showScreen(name, { moveFocus = true } = {}) {
  state.screen = name;
  document.querySelectorAll('[data-screen]').forEach(s => { s.hidden = s.dataset.screen !== name; });
  const navName = name === 'results' ? 'practice' : name; // results belong to Practice in the menu
  document.querySelectorAll('.nav-item').forEach(b => {
    if (b.dataset.nav === navName) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  $('#topTitle').textContent = TITLES[name];
  closeMenu();
  window.scrollTo({ top: 0 });
  if (name === 'dashboard') renderDashboard();
  if (name === 'phrasebook') renderPhrasebook();
  if (name === 'progress') renderProgress();
  if (name === 'library') renderLibrary();
  if (name === 'results') renderResults();
  // Move keyboard and screen-reader focus to the new screen's heading,
  // so the user starts reading at the top of the new screen
  if (moveFocus) {
    const h1 = document.querySelector(`[data-screen="${name}"] h1`);
    h1.tabIndex = -1;
    h1.focus({ preventScroll: true });
  }
}

document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) { showScreen(nav.dataset.nav); return; }
  const start = e.target.closest('[data-start]');
  if (start) { selectScenario(start.dataset.start); showScreen('practice'); }
});

// End session: show the results, unless no reply was sent (the coach panel explains that)
$('#endBtn').addEventListener('click', () => {
  endSession();
  if (state.feedback) showScreen('results');
});

// Mobile drawer
// "inert" makes part of the page unreachable with Tab and invisible to screen readers.
// On phones: menu closed → the off-screen menu is inert.
//            menu open   → everything else is inert, so focus stays inside the menu (a "focus trap").
const phone = window.matchMedia('(max-width: 880px)'); // the same width as the CSS that hides the sidebar
function syncSidebar() {
  const open = $('#sidebar').classList.contains('open');
  $('#sidebar').inert = phone.matches && !open;
  $('.main').inert = phone.matches && open;
  $('.skip-link').inert = phone.matches && open;
}
function openMenu() {
  $('#sidebar').classList.add('open'); $('#scrim').hidden = false; $('#menuBtn').setAttribute('aria-expanded', 'true');
  syncSidebar();
  $('#sidebar .nav-item').focus();
}
function closeMenu() {
  $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false');
  syncSidebar();
}
$('#menuBtn').addEventListener('click', openMenu);
$('#scrim').addEventListener('click', () => { closeMenu(); $('#menuBtn').focus(); });
$('#menuClose').addEventListener('click', () => { closeMenu(); $('#menuBtn').focus(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#sidebar').classList.contains('open')) { closeMenu(); $('#menuBtn').focus(); }
});
phone.addEventListener('change', syncSidebar); // e.g. rotating a tablet
syncSidebar();

// Copy buttons on any screen (dashboard and phrasebook)
document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]');
  if (c) copyText(c.dataset.copy);
});

/* =========================================================
   11. SETTINGS
   ========================================================= */
$('#setGoal').addEventListener('input', (e) => { $('#setGoalOut').textContent = `${e.target.value} session${e.target.value === '1' ? '' : 's'}`; });
$('#settingsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.dailyGoal = Number($('#setGoal').value);
  state.showExplanations = $('#setExplain').checked;
  state.englishLevel = $('#setLevel').value;
  setPlatform($('#setPlatform').value);
  $('#toneSel').value = $('#setTone').value;
  try {
    localStorage.setItem('ccc-settings', JSON.stringify({ goal: state.dailyGoal, explain: state.showExplanations, platform: $('#setPlatform').value, tone: $('#setTone').value, level: $('#setLevel').value }));
  } catch (err) { /* storage blocked */ }
  renderGoal();
  renderCoach();
  toast('Settings saved in this browser');
});
// Reset progress: ask first, because this cannot be undone
$('#resetProgress').addEventListener('click', () => {
  if (!confirm('Delete all your practice progress in this browser? This cannot be undone.')) return;
  resetProgress();
  renderGoal();
  toast('Progress reset');
});

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('ccc-settings') || 'null');
    if (!s) return;
    state.dailyGoal = s.goal; $('#setGoal').value = s.goal; $('#setGoalOut').textContent = `${s.goal} session${s.goal === 1 ? '' : 's'}`;
    state.showExplanations = s.explain; $('#setExplain').checked = s.explain;
    $('#setPlatform').value = s.platform; setPlatform(s.platform);
    $('#setTone').value = s.tone; $('#toneSel').value = s.tone;
    // Older saves used the visible text ("Intermediate"), so compare in lower case
    const level = String(s.level || '').toLowerCase();
    if (['beginner', 'intermediate', 'advanced'].includes(level)) {
      state.englishLevel = level; $('#setLevel').value = level;
    }
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
showScreen('dashboard', { moveFocus: false }); // don't move focus when the page first loads
