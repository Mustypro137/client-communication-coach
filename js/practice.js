import { $, icon, escapeHTML, difficultyHTML, toast, copyText, announce } from './utils.js';
import { SCENARIOS } from './data.js';
import { state } from './state.js';
import { renderGoal } from './dashboard.js';
import { recordSession, dayKey } from './progress.js';
import { analyzeReply, scoreLabel } from './coach.js';

/* =========================================================
   7. PRACTICE WITH A CLIENT
   ========================================================= */
const scenario = () => SCENARIOS.find(s => s.id === state.scenarioId);
function nextTime() {
  state.clockMinutes += 1 + Math.floor(Math.random() * 2);
  const h = Math.floor(state.clockMinutes / 60), m = state.clockMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function renderPicker() {
  $('#scenarioPicker').innerHTML = SCENARIOS.map(s => `
    <button class="scenario-tab" data-scenario="${s.id}" aria-pressed="${s.id === state.scenarioId}">
      <span class="client-avatar" style="--avatar-bg:${s.avatarBg}">${s.initials}</span>
      <span style="min-width:0"><strong>${s.title}</strong><span>${['Beginner', 'Intermediate', 'Advanced'][s.level - 1]}</span></span>
    </button>`).join('');
}
$('#scenarioPicker').addEventListener('click', (e) => {
  const b = e.target.closest('[data-scenario]');
  if (b) selectScenario(b.dataset.scenario);
});

export function selectScenario(id) {
  state.scenarioId = id;
  startSession();
  renderPicker();
}

export function startSession() {
  const s = scenario();
  state.messages = [];
  state.replyCount = 0;
  state.feedback = null;
  state.ended = false;
  state.clientTyping = false;
  state.sessionId = null;          // a new session is saved when you send your first reply
  state.sessionStart = Date.now();
  state.clockMinutes = 9 * 60 + 38;
  // An opening line is usually client text. It can also be an object:
  // { from: 'you', text } for a message you "sent" earlier, or { from: 'note', text } for a grey divider.
  s.opening.forEach(line => {
    if (typeof line === 'string') state.messages.push({ from: 'client', text: line, time: nextTime() });
    else state.messages.push({ ...line, time: line.time || nextTime(), opening: true });
  });

  $('#cAvatar').textContent = s.initials;
  $('#cAvatar').style.setProperty('--avatar-bg', s.avatarBg);
  $('#cName').textContent = s.client;
  $('#cRole').textContent = s.role;
  $('#sTitle').textContent = s.title;
  $('#sObjective').textContent = s.objective;
  $('#sDifficulty').innerHTML = difficultyHTML(s.level);
  $('#replyInput').value = '';
  renderThread();
  renderCoach();
  setComposerEnabled(true);
}

function renderThread() {
  const s = scenario();
  // Show "Today" at the top, unless the scenario starts with its own note
  let html = state.messages[0] && state.messages[0].from === 'note' ? '' : '<div class="day-sep mono">Today</div>';
  html += state.messages.map(m => {
    if (m.from === 'note') return `<div class="day-sep mono">${escapeHTML(m.text)}</div>`;
    if (m.from === 'client') {
      return `<div class="msg msg-client"><div class="client-avatar" style="--avatar-bg:${s.avatarBg}">${s.initials}</div><div><div class="bubble">${escapeHTML(m.text)}</div><div class="msg-time">${m.time}</div></div></div>`;
    }
    return `<div class="msg msg-you"><div><div class="bubble">${escapeHTML(m.text)}</div><div class="msg-time">${m.time} · You</div></div></div>`;
  }).join('');
  if (state.clientTyping) {
    html += `<div class="msg msg-client"><div class="client-avatar" style="--avatar-bg:${s.avatarBg}">${s.initials}</div><div class="bubble"><span class="typing" aria-label="${s.client} is typing"><i></i><i></i><i></i></span></div></div>`;
  }
  if (state.ended) html += state.feedback
    ? `<div class="ended-note">Session ended. <button class="link-btn" data-nav="results">See your results</button> or press Restart to try again.</div>`
    : `<div class="ended-note">Session ended. Press Restart to try again.</div>`;
  const thread = $('#thread');
  thread.innerHTML = html;
  thread.scrollTop = thread.scrollHeight;
}

function setComposerEnabled(on) {
  $('#replyInput').disabled = !on;
  $('#sendBtn').disabled = !on;
  $('#endBtn').disabled = !on;
}

$('#composer').addEventListener('submit', (e) => { e.preventDefault(); sendReply(); });
$('#replyInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); sendReply(); }
});
$('#restartBtn').addEventListener('click', () => { startSession(); toast('Scenario restarted'); });
// "End session": main.js calls this, then opens the results screen
export function endSession() {
  state.ended = true;
  setComposerEnabled(false);
  renderThread();
  renderCoach();
}

function sendReply() {
  const text = $('#replyInput').value.trim();
  if (!text || state.ended || state.clientTyping) {
    if (!text) $('#replyInput').focus();
    return;
  }
  state.messages.push({ from: 'you', text, time: nextTime() });
  state.replyCount++;
  $('#replyInput').value = '';

  // Simulated coach: rule-based analysis of the reply (no real AI)
  state.feedback = analyzeReply(text, {
    scenario: scenario(),
    yourReplies: state.messages.filter(m => m.from === 'you' && !m.opening).map(m => m.text), // all your replies so far, this one too
    level: state.englishLevel
  });
  // Save this session to your progress after every reply, so a refresh never loses it
  if (!state.sessionId) state.sessionId = Date.now();
  recordSession({
    id: state.sessionId,
    date: dayKey(),
    scenarioId: state.scenarioId,
    replies: state.replyCount,
    score: state.feedback.score,
    minutes: Math.max(1, Math.round((Date.now() - state.sessionStart) / 60000)),
    skills: state.feedback.skills
  });
  renderGoal();
  renderCoach();
  announce(`Coach feedback ready. Score ${state.feedback.score}, ${scoreLabel(state.feedback.score)}.`);

  // Simulated client: next scripted answer after a short "typing" pause
  state.clientTyping = true;
  setComposerEnabled(false);
  $('#endBtn').disabled = false;
  renderThread();
  setTimeout(() => {
    const s = scenario();
    const next = s.followUps[state.replyCount - 1] || 'Thank you, I will get back to you soon.';
    state.clientTyping = false;
    if (!state.ended) {
      state.messages.push({ from: 'client', text: next, time: nextTime() });
      setComposerEnabled(true);
      announce(`${s.client.split(' ')[0]} replied: ${next}`);
    }
    renderThread();
  }, 1300);
}

/* Try again: remove your last reply (and the client's answer) and put your text back */
function tryAgain() {
  let lastYou = -1;
  state.messages.forEach((m, i) => { if (m.from === 'you' && !m.opening) lastYou = i; }); // skip pre-written messages
  if (lastYou === -1) return;
  const text = state.messages[lastYou].text;
  state.messages = state.messages.slice(0, lastYou);
  state.replyCount = Math.max(0, state.replyCount - 1);
  state.ended = false;
  state.clientTyping = false;
  state.feedback = null;
  setComposerEnabled(true);
  renderThread();
  renderCoach();
  const box = $('#replyInput');
  box.value = text;
  box.focus();
}

export function renderCoach() {
  const s = scenario();
  const coach = $('#coach');
  const head = (scoreHTML = '') => `<div class="coach-head"><span class="coach-badge">${icon('coach', 15)}Your coach</span>${scoreHTML}</div>`;

  if (!state.feedback) {
    coach.innerHTML = head() + `
      <div class="coach-empty">
        <h3>${state.ended ? 'No replies in this session' : 'Waiting for your first reply'}</h3>
        <p>${state.ended ? 'Restart the scenario and send at least one reply to get feedback.' : `Reply to ${s.client.split(' ')[0]} and you'll see feedback on your English, your tone and the questions you asked.`}</p>
        <ol class="coach-tips">
          <li>Greet the client and thank them</li>
          <li>Ask questions before you talk about price</li>
          <li>End with a clear next step</li>
        </ol>
      </div>`;
    return;
  }

  const f = state.feedback;
  const list = (items, cls, ic) => `<ul class="fb-list">${items.map(t => `<li class="${cls}">${icon(ic, 15)}<span>${escapeHTML(t)}</span></li>`).join('')}</ul>`;
  const englishHTML = f.english.length
    ? f.english.map(e => `<div class="fix"><div class="pair"><del>${escapeHTML(e.wrong)}</del>${icon('arrow', 13)}<ins>${escapeHTML(e.right)}</ins></div>${state.showExplanations ? `<small>${e.note}</small>` : ''}</div>`).join('')
    : `<ul class="fb-list"><li class="good">${icon('check', 15)}<span>No grammar problems found in this reply.</span></li></ul>`;
  const profHTML = `<ul class="fb-list">${f.prof.map(p => `<li class="${p.type}">${icon(p.type === 'good' ? 'check' : 'alert', 15)}<span>${escapeHTML(p.text)}</span></li>`).join('')}</ul>`;
  const forgotHTML = f.forgotten.length
    ? list(f.forgotten, 'ask', 'question')
    : `<ul class="fb-list"><li class="good">${icon('check', 15)}<span>You covered every key topic. Well done.</span></li></ul>`;

  coach.innerHTML = head(`<div class="coach-score"><strong>${f.score}</strong><span>${scoreLabel(f.score)}</span></div>`) + `
    <div class="coach-body">
      <section class="coach-sec"><h3>What you did well</h3>${list(f.good, 'good', 'check')}</section>
      <section class="coach-sec"><h3>Improve your English <span class="n">${f.english.length}</span></h3>${englishHTML}</section>
      <section class="coach-sec"><h3>Professionalism</h3>${profHTML}</section>
      <section class="coach-sec"><h3>Questions you forgot to ask <span class="n">${f.forgotten.length}</span></h3>${forgotHTML}</section>
      <section class="coach-sec"><h3>Suggested improved reply</h3><div class="model-reply" id="modelReply">${escapeHTML(f.model)}</div></section>
      <div class="coach-actions">
        <button class="btn btn-primary btn-sm" id="tryAgainBtn">${icon('restart', 15)}Try again</button>
        <button class="btn btn-secondary btn-sm" id="useModelBtn">${icon('edit', 15)}Edit this reply</button>
        <button class="btn btn-ghost btn-sm" id="copyModelBtn">${icon('copy', 15)}Copy</button>
      </div>
    </div>`;
  $('#tryAgainBtn').onclick = tryAgain;
  $('#copyModelBtn').onclick = () => copyText(f.model);
  $('#useModelBtn').onclick = () => {
    if (state.ended) { toast('Restart the session to send another reply'); return; }
    $('#replyInput').value = f.model;
    $('#replyInput').focus();
  };
}
