import { $, icon, escapeHTML, difficultyHTML, toast, copyText } from './utils.js';
import { SCENARIOS, WEEK_MINUTES } from './data.js';
import { state } from './state.js';
import { renderGoal } from './dashboard.js';

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
  state.countedThisSession = false;
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
  if (state.ended) html += `<div class="ended-note">Session ended. Review your feedback, or press Restart to try again.</div>`;
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
$('#endBtn').addEventListener('click', () => {
  state.ended = true;
  setComposerEnabled(false);
  renderThread();
  renderCoach();
});

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
  state.feedback = analyzeReply(text);
  if (!state.countedThisSession) {
    state.countedThisSession = true;
    state.sessionsToday++;
    WEEK_MINUTES[6] += 6;
    renderGoal();
  }
  renderCoach();

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

/* ---------- The simulated coach ---------- */
const ENGLISH_RULES = [
  { re: /(^|[\s(,])i(?=[\s',.!?]|$)/, fix: '$1I', note: 'Always write "I" with a capital letter.', caseSensitive: true },
  { re: /\bu\b/i, fix: 'you', note: 'Write the full word "you" with clients. "u" looks like a text to a friend.' },
  { re: /\bur\b/i, fix: 'your', note: 'Write "your" in full.' },
  { re: /\b(pls|plz)\b/i, fix: 'please', note: 'Write "please" in full.' },
  { re: /\bwanna\b/i, fix: 'want to', note: '"Wanna" is very informal.' },
  { re: /\bgonna\b/i, fix: 'going to', note: '"Gonna" is very informal.' },
  { re: /\bi am agree\b/i, fix: 'I agree', note: '"Agree" is already a verb, so you don\'t need "am".' },
  { re: /\binformations\b/i, fix: 'information', note: '"Information" has no plural. Say "some information".' },
  { re: /\badvices\b/i, fix: 'advice', note: '"Advice" has no plural.' },
  { re: /\bdiscuss about\b/i, fix: 'discuss', note: 'Say "discuss the project", without "about".' },
  { re: /\bsince (\d+|one|two|three|four|five|a few) (years?|months?|weeks?|days?)\b/i, fix: 'for $1 $2', note: 'Use "for" with a length of time. Use "since" with a starting point, like "since 2022".' },
  { re: /\bmore (better|cheaper|faster|easier|bigger)\b/i, fix: '$1', note: 'These words already compare, so you don\'t need "more".' },
  { re: /\bcan able to\b/i, fix: 'can', note: 'Say "I can" or "I am able to", not both.' },
  { re: /\bthanks you\b/i, fix: 'thank you', note: 'Say "thank you" or "thanks".' },
  { re: /\bhow much it cost\b/i, fix: 'how much it costs', note: 'Add "s": it costs.' },
  { re: /\bdepend of\b/i, fix: 'depend on', note: 'In English we say "depend on".' }
];
const SLANG = /\b(u|ur|pls|plz|wanna|gonna|bro|lol|k|thx)\b/i;

function analyzeReply(text) {
  const s = scenario();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const questions = (text.match(/\?/g) || []).length;
  const hasGreeting = /^(hi|hello|good (morning|afternoon|evening)|dear|hey|thank)/i.test(text.trim());
  const hasThanks = /\b(thank|thanks|appreciate)\b/i.test(text);
  const hasNextStep = /\b(call|meeting|meet|quote|proposal|send you|schedule|next step|this week|today|tomorrow)\b/i.test(text);
  const givesPriceEarly = s.id === 'bakery' && /(\$\s?\d|\d+\s?(k|000|dollars|cfa|fcfa))/i.test(text) && questions < 2;
  const agreesDiscount = s.id === 'discount' && /\b(yes|ok|okay|sure)\b.*\b800\b|\b800\b.*\b(fine|okay|ok|works)\b/i.test(text);
  const freeWork = s.id === 'scope' && /\b(no problem|sure|yes|ok)\b/i.test(text) && !/\b(cost|price|quote|extra|fee)\b/i.test(text);
  const rushYes = s.id === 'deadline' && /\b(yes|sure|ok|okay|no problem)\b/i.test(text) && !/\b(but|if|only|first version|smaller|simple|realistic|rush|extra)\b/i.test(text);
  const noApology = s.id === 'complaint' && !/\b(sorry|apologi[sz]e)\b/i.test(text);
  const blames = s.id === 'complaint' && /\b(your fault|you must have|you didn't|you did not|you broke)\b/i.test(text);
  const pushy = s.id === 'followup' && /(why (haven't|have not|didn't|did not) you|still waiting|\basap\b|\burgent)/i.test(text);

  // English corrections
  const english = [];
  ENGLISH_RULES.forEach(rule => {
    const m = text.match(rule.re);
    if (m && english.length < 4) {
      english.push({ wrong: m[0].trim(), right: m[0].replace(rule.re, rule.fix).trim(), note: rule.note });
    }
  });
  if (/^[a-z]/.test(text.trim()) && english.length < 4) {
    const first = text.trim().split(/\s+/)[0];
    english.push({ wrong: first, right: first[0].toUpperCase() + first.slice(1), note: 'Start your message with a capital letter.' });
  }
  if (!/[.!?)]$/.test(text.trim()) && english.length < 4) {
    english.push({ wrong: '…' + text.trim().slice(-14), right: '…' + text.trim().slice(-14) + '.', note: 'End your message with a full stop or a question mark.' });
  }

  // Professionalism notes
  const prof = [];
  prof.push(hasGreeting ? { type: 'good', text: 'You opened with a greeting, so the reply feels warm.' } : { type: 'tip', text: 'Start with a greeting and the client\'s name, e.g. "Good morning, Mrs. Mensah".' });
  if (!hasThanks) prof.push({ type: 'tip', text: 'Thank the client for contacting you. It sets a positive tone.' });
  if (words < 15) prof.push({ type: 'tip', text: 'Your reply is very short. The client may feel you are in a hurry.' });
  if (words > 170) prof.push({ type: 'tip', text: 'Your reply is long for a chat. Try to keep it under 120 words.' });
  if (SLANG.test(text)) prof.push({ type: 'tip', text: 'Avoid chat slang with clients. Full words look more professional.' });
  if (/!{2,}/.test(text) || /\b[A-Z]{4,}\b/.test(text)) prof.push({ type: 'tip', text: 'Avoid "!!!" and words in capital letters. They can feel like shouting.' });
  if (givesPriceEarly) prof.push({ type: 'tip', text: 'You gave a price before you understood the project. Ask questions first, then quote.' });
  if (agreesDiscount) prof.push({ type: 'tip', text: 'You accepted a 33% discount quickly. Offer a smaller scope instead, so your price stays fair.' });
  if (freeWork) prof.push({ type: 'tip', text: 'You agreed to new work without mentioning the cost. Extra work needs its own quote.' });
  if (rushYes) prof.push({ type: 'tip', text: 'You said yes to a very short deadline with no conditions. Offer a smaller first version or a realistic date.' });
  if (noApology) prof.push({ type: 'tip', text: 'Start by saying sorry. The client is losing money, so show that you understand.' });
  if (blames) prof.push({ type: 'tip', text: 'Avoid blaming the client. Focus on finding and fixing the problem.' });
  if (pushy) prof.push({ type: 'tip', text: 'This sounds like pressure. Remind the client kindly and make it easy to reply.' });
  prof.push(hasNextStep ? { type: 'good', text: 'You suggested a clear next step.' } : { type: 'tip', text: 'End with a next step: a call, a quote, or a date.' });

  // Questions forgotten — checked across ALL your replies in this session
  const allYou = state.messages.filter(m => m.from === 'you' && !m.opening).map(m => m.text.toLowerCase()).join(' ');
  const forgotten = s.checks.filter(c => !c.words.some(w => allYou.includes(w))).map(c => c.label);
  const asked = s.checks.length - forgotten.length;

  // What went well
  const good = [];
  if (hasGreeting) good.push('Friendly greeting');
  if (hasThanks) good.push('You thanked the client');
  if (questions > 0) good.push(`You asked ${questions} question${questions > 1 ? 's' : ''}`);
  if (asked > 0) good.push(`You covered ${asked} of ${s.checks.length} key topics`);
  if (english.length === 0) good.push('Clean, correct English');
  if (hasNextStep) good.push('Clear next step');
  if (words >= 25 && words <= 150) good.push('Good length for a chat message');
  if (good.length === 0) good.push('You replied and kept the conversation going. That is the first step.');

  // Score (simple, transparent formula)
  let score = 35;
  score += hasGreeting ? 10 : 0;
  score += hasThanks ? 8 : 0;
  score += Math.min(questions, 3) * 6;
  score += Math.round((asked / s.checks.length) * 15);
  score += hasNextStep ? 10 : 0;
  score += english.length === 0 ? 10 : -4 * english.length;
  score += words >= 25 && words <= 150 ? 6 : 0;
  score -= (givesPriceEarly || agreesDiscount || freeWork || rushYes || noApology || blames || pushy) ? 12 : 0;
  score = Math.max(20, Math.min(97, score));

  return { score, good, english, prof, forgotten, model: s.modelReply };
}

function scoreLabel(n) { return n >= 80 ? 'Strong reply' : n >= 60 ? 'Good start' : 'Needs work'; }

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
