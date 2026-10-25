/* =========================================================
   ENGLISH CHECK — simple grammar rules (no real AI)
   Used by the coach (practice.js) and Message Studio (studio.js).
   A real AI could replace checkEnglish() later.
   ========================================================= */
export const ENGLISH_RULES = [
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

// Returns up to 4 corrections: [{ wrong, right, note }]
// checkEnding: also ask for a full stop at the end (off for drafts that end with a signature)
export function checkEnglish(text, { checkEnding = true } = {}) {
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
  if (checkEnding && !/[.!?)]$/.test(text.trim()) && english.length < 4) {
    english.push({ wrong: '…' + text.trim().slice(-14), right: '…' + text.trim().slice(-14) + '.', note: 'End your message with a full stop or a question mark.' });
  }
  return english;
}
