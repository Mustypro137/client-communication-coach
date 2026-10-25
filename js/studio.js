import { $, icon, escapeHTML, toast, copyText } from './utils.js';
import { state } from './state.js';
import { checkEnglish } from './english.js';

/* =========================================================
   8. MESSAGE STUDIO — template-based drafts (no real AI)
   ========================================================= */
function detectName(msg) {
  const m = msg.match(/\b(?:I'm|I am|my name is|this is|it's)\s+([A-Z][a-zA-Z\-]+)/) || msg.match(/(?:^|\n)\s*[-–—]\s*([A-Z][a-z]+)\s*$/);
  return m ? m[1] : '';
}
function detectThing(msg) {
  const t = msg.toLowerCase();
  if (t.includes('app')) return 'app';
  if (t.includes('website') || t.includes('site') || t.includes('landing')) return 'website';
  if (t.includes('dashboard')) return 'dashboard';
  return 'project';
}

const DRAFTS = {
  inquiry: {
    full: (t) => `Thank you for reaching out! I'd be happy to help with your ${t}.\n\nBefore I share a price, could you tell me a little more?\n• Which pages or features you need\n• If you already have a logo, photos and text\n• When you would like it to be ready\n\nOnce I have this, I'll send you a clear quote and timeline within 24 hours.`,
    short: (t) => `Thanks for your message! Yes, I can help with your ${t}.\n\nTo give you an exact price, could you share which pages you need and your deadline? I'll reply with a quote within 24 hours.`,
    why: ['It thanks the client and says yes before anything else.', 'It asks questions before giving a price, so your quote will be accurate.', 'It ends with a clear promise: a quote within 24 hours.']
  },
  pricing: {
    full: (t) => `Thank you for your interest. My price depends on the size of the ${t}. A simple ${t} like the one you describe usually starts at [your price].\n\nThis includes design, development, mobile layout and two rounds of revisions. I ask for a 50% deposit to start and 50% at launch.\n\nIf you share your budget range, I can suggest the best option for you.`,
    short: (t) => `A ${t} like this usually starts at [your price], including two rounds of revisions. I ask for 50% to start and 50% at launch. Do you have a budget range in mind?`,
    why: ['It gives a starting price, so the client is not left guessing.', 'It explains what the price includes and how payment works.', 'Asking for their budget keeps the conversation open. Replace [your price] before you send.']
  },
  details: {
    full: (t) => `Thank you for the details so far. To plan your ${t} properly, I have a few questions:\n\n1. Who are your main customers?\n2. Which pages or features are most important?\n3. Do you have examples of ${t}s you like?\n4. What is your ideal launch date?\n\nYour answers will help me give you an accurate quote.`,
    short: (t) => `Thanks! A few quick questions so I can plan your ${t}: which features matter most, do you have examples you like, and when do you want to launch?`,
    why: ['Numbered questions are easy to answer one by one.', 'It explains why you are asking, so it doesn\'t feel like a test.', 'Asking for examples saves time on revisions later.']
  },
  followup: {
    full: (t) => `I hope you're doing well. I'm following up on my message from [day] about your ${t}.\n\nHave you had a chance to look at it? I'm happy to answer any questions or adjust the proposal if needed.\n\nIf now isn't the right time, no problem. I'm here when you're ready.`,
    short: (t) => `Just following up on my message about your ${t}. Any questions I can help with?`,
    why: ['It reminds the client without blaming them for the silence.', 'It offers help, which makes it easy to reply.', 'The last line keeps the relationship positive even if they say no.']
  },
  decline: {
    full: (t) => `Thank you for thinking of me for this ${t}. Unfortunately, I can't take it on right now because my schedule is full until [date].\n\nIf the timing works later, I'd be glad to talk again. I can also recommend another developer if that helps.`,
    short: (t) => `Thank you for thinking of me! I'm fully booked until [date], so I can't take this ${t} right now. Happy to talk again later.`,
    why: ['It says no clearly, with a simple reason.', 'It stays warm, so the client may come back later.', 'Offering a recommendation shows you care about their success.']
  }
};

// Key details a freelancer usually needs. If the client's message doesn't mention one, suggest asking.
const CLARIFY = [
  { ask: 'What is your budget range?', words: ['budget', '$', 'price range', 'afford', 'spend'] },
  { ask: 'When do you need it to be ready?', words: ['deadline', 'by ', 'this month', 'next month', 'week', 'date', 'urgent', 'asap', 'launch', 'ready'] },
  { ask: 'Which pages or features do you need?', words: ['page', 'feature', 'book', 'shop', 'gallery', 'form', 'price', 'menu', 'payment'] },
  { ask: 'Do you already have a logo, photos and text?', words: ['logo', 'photo', 'picture', 'image', 'content', 'text'] }
];
function clarifyQuestions(msg, goal) {
  if (!['inquiry', 'pricing', 'details'].includes(goal)) return null; // not needed when following up or declining
  const t = msg.toLowerCase();
  return CLARIFY.filter(c => !c.words.some(w => t.includes(w))).map(c => c.ask);
}

export function generateDraft() {
  const msg = $('#clientMsg').value.trim();
  const goal = $('#goalSel').value;
  const tone = $('#toneSel').value;
  const platform = state.studio.platform;
  if (!msg) {
    $('#clientMsg').focus();
    toast('Paste a client message first');
    return;
  }
  const name = detectName(msg);
  const thing = detectThing(msg);
  const tpl = DRAFTS[goal];
  const body = (tone === 'concise' || (platform === 'whatsapp' && tone !== 'professional' && goal === 'followup')) ? tpl.short(thing) : tpl.full(thing);

  let greeting, closing;
  if (platform === 'whatsapp') {
    greeting = tone === 'professional' ? `Hello${name ? ' ' + name : ''},` : `Hi${name ? ' ' + name : ''}!`;
    closing = tone === 'friendly' ? 'Have a lovely day!' : '';
  } else {
    greeting = tone === 'professional' ? `Dear ${name || '[name]'},` : `Hi ${name || '[name]'},`;
    closing = tone === 'concise' ? 'Best,\n[Your name]' : 'Best regards,\n[Your name]';
  }
  let softBody = body;
  if (tone === 'professional') softBody = softBody.replace(/!/g, '.');
  const draft = [greeting, softBody, closing].filter(Boolean).join('\n\n');

  const reasons = [...tpl.why];
  reasons.push(platform === 'whatsapp'
    ? 'WhatsApp style: short paragraphs and no formal signature, easy to read on a phone.'
    : 'LinkedIn style: a proper greeting and a signature, like a short professional email.');
  reasons.push({ friendly: 'Warm and conversational: friendly words, but still professional.', professional: 'Professional and friendly: polite and calm, no exclamation marks.', concise: 'Short and direct: only the key information, for busy clients.' }[tone]);

  state.studio.clarify = clarifyQuestions(msg, goal);
  state.studio.draft = draft;
  state.studio.original = draft;
  state.studio.reasons = reasons;
  state.studio.meta = { platform, tone, goal };
  renderDraft();
}

export function renderDraft() {
  const card = $('#draftCard');
  const st = state.studio;
  if (!st.draft) {
    card.innerHTML = `<div class="draft-empty"><div class="icon-circle">${icon('pen', 22)}</div><h3>Your draft will appear here</h3><p>Choose a goal and tone, then press <strong>Generate draft</strong>. You can edit every word.</p></div>`;
    return;
  }
  const goalLabel = $('#goalSel').selectedOptions[0].textContent;
  const clarifyHTML = st.clarify ? `
    <div class="why">
      <h3>Questions to clarify</h3>
      <ul class="fb-list">${st.clarify.length
        ? st.clarify.map(q => `<li class="ask">${icon('question', 15)}<span>${escapeHTML(q)}</span></li>`).join('')
        : `<li class="good">${icon('check', 15)}<span>The client already gave the key details.</span></li>`}</ul>
    </div>` : '';
  card.innerHTML = `
    <div class="card-head" style="margin:0"><h2>Suggested reply</h2>
      <div class="draft-meta"><span class="tag">${st.meta.platform === 'whatsapp' ? 'WhatsApp' : 'LinkedIn'}</span><span class="tag tag-good">${goalLabel}</span><span class="tag" title="Made from templates and simple rules, not real AI">Template-based</span></div>
    </div>
    <div class="field">
      <label for="draftArea">Edit before you copy. Replace anything in [brackets].</label>
      <textarea class="textarea draft-area" id="draftArea">${escapeHTML(st.draft)}</textarea>
    </div>
    <div class="draft-foot">
      <span class="mono muted" id="wordCount"></span>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-ghost btn-sm" id="resetDraft">${icon('restart', 15)}Reset</button>
        <button class="btn btn-secondary btn-sm" id="checkDraft">${icon('check', 15)}Check my English</button>
        <button class="btn btn-accent" id="copyDraft">${icon('copy', 15)}Copy reply</button>
      </div>
    </div>
    <div class="why" id="englishResult" aria-live="polite" hidden></div>${clarifyHTML}
    <div class="why">
      <h3>Why this reply works</h3>
      <ul class="fb-list">${st.reasons.map(r => `<li class="good">${icon('check', 15)}<span>${escapeHTML(r)}</span></li>`).join('')}</ul>
    </div>`;
  const area = $('#draftArea');
  const count = () => { const w = area.value.trim().split(/\s+/).filter(Boolean).length; $('#wordCount').textContent = `${w} words · ${area.value.length} characters`; };
  count();
  area.addEventListener('input', () => { st.draft = area.value; count(); $('#englishResult').hidden = true; }); // old check results are out of date
  // Check my English: the same simple rules as the coach (no full stop needed after a signature)
  $('#checkDraft').onclick = () => {
    const items = checkEnglish(area.value, { checkEnding: false }).map(f =>
      `<li class="tip">${icon('alert', 15)}<span>"${escapeHTML(f.wrong)}" → "${escapeHTML(f.right)}". ${escapeHTML(f.note)}</span></li>`);
    if (/\[[^\]]+\]/.test(area.value)) items.push(`<li class="tip">${icon('alert', 15)}<span>Replace the text in [brackets] before you send.</span></li>`);
    const result = $('#englishResult');
    result.innerHTML = `<h3>English check</h3><ul class="fb-list">${items.length
      ? items.join('')
      : `<li class="good">${icon('check', 15)}<span>No problems found by the simple rules. Read it once more before you send.</span></li>`}</ul>`;
    result.hidden = false;
  };
  $('#copyDraft').onclick = () => copyText(area.value, area);
  $('#resetDraft').onclick = () => { st.draft = st.original; area.value = st.original; count(); toast('Draft reset'); };
}

$('#platformSeg').addEventListener('click', (e) => {
  const b = e.target.closest('[data-platform]');
  if (!b) return;
  setPlatform(b.dataset.platform);
});
export function setPlatform(p) {
  state.studio.platform = p;
  document.querySelectorAll('[data-platform]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.platform === p)));
}
$('#studioForm').addEventListener('submit', (e) => { e.preventDefault(); generateDraft(); });
