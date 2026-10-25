/* =========================================================
   ENGLISH CHECK — simple grammar rules (no real AI)
   Used by the coach (practice.js) and Message Studio (studio.js).
   A real AI could replace checkEnglish() later.
   ========================================================= */

// Each rule explains itself in 3 ways, one per "English level" in Settings:
//   beginner     – very simple words and a short correct example
//   intermediate – a normal explanation
//   advanced     – short, with the grammar name
export const ENGLISH_RULES = [
  { re: /(^|[\s(,])i(?=[\s',.!?]|$)/, fix: '$1I', caseSensitive: true, note: {
    beginner: 'Write "I" as a big letter every time. Example: "I can help."',
    intermediate: 'Always write "I" with a capital letter.',
    advanced: 'The pronoun "I" is always capitalised.' } },
  { re: /\bu\b/i, fix: 'you', note: {
    beginner: 'Write "you", not "u". Example: "Thank you."',
    intermediate: 'Write the full word "you" with clients. "u" looks like a text to a friend.',
    advanced: 'Text-speak abbreviation; too informal for clients.' } },
  { re: /\bur\b/i, fix: 'your', note: {
    beginner: 'Write "your", not "ur". Example: "Thanks for your message."',
    intermediate: 'Write "your" in full.',
    advanced: 'Text-speak abbreviation; use the full possessive "your".' } },
  { re: /\b(pls|plz)\b/i, fix: 'please', note: {
    beginner: 'Write "please", not "pls". Example: "Please send the logo."',
    intermediate: 'Write "please" in full.',
    advanced: 'Text-speak abbreviation; write it in full.' } },
  { re: /\bwanna\b/i, fix: 'want to', note: {
    beginner: 'Write "want to", not "wanna". Example: "I want to help you."',
    intermediate: '"Wanna" is very informal.',
    advanced: 'Informal contraction; avoid in professional writing.' } },
  { re: /\bgonna\b/i, fix: 'going to', note: {
    beginner: 'Write "going to", not "gonna". Example: "I am going to send it today."',
    intermediate: '"Gonna" is very informal.',
    advanced: 'Informal contraction; avoid in professional writing.' } },
  { re: /\bi am agree\b/i, fix: 'I agree', note: {
    beginner: 'Do not use "am" with "agree". Example: "I agree with you."',
    intermediate: '"Agree" is already a verb, so you don\'t need "am".',
    advanced: '"Agree" is a verb, not an adjective; no auxiliary "be".' } },
  { re: /\binformations\b/i, fix: 'information', note: {
    beginner: 'Never add "s" to "information". Example: "Thanks for the information."',
    intermediate: '"Information" has no plural. Say "some information".',
    advanced: 'Uncountable noun: no plural form.' } },
  { re: /\badvices\b/i, fix: 'advice', note: {
    beginner: 'Never add "s" to "advice". Example: "Thank you for your advice."',
    intermediate: '"Advice" has no plural.',
    advanced: 'Uncountable noun: no plural form.' } },
  { re: /\bdiscuss about\b/i, fix: 'discuss', note: {
    beginner: 'Do not put "about" after "discuss". Example: "Let\'s discuss the project."',
    intermediate: 'Say "discuss the project", without "about".',
    advanced: 'Transitive verb: takes a direct object, no preposition.' } },
  { re: /\bsince (\d+|one|two|three|four|five|a few) (years?|months?|weeks?|days?)\b/i, fix: 'for $1 $2', note: {
    beginner: 'Use "for" with a number of days or years. Example: "I have worked here for 3 years."',
    intermediate: 'Use "for" with a length of time. Use "since" with a starting point, like "since 2022".',
    advanced: '"For" + duration; "since" + point in time.' } },
  { re: /\bmore (better|cheaper|faster|easier|bigger)\b/i, fix: '$1', note: {
    beginner: 'Do not put "more" before words like "better". Example: "This plan is cheaper."',
    intermediate: 'These words already compare, so you don\'t need "more".',
    advanced: 'Double comparative; the "-er" form is enough.' } },
  { re: /\bcan able to\b/i, fix: 'can', note: {
    beginner: 'Use "can" alone. Example: "I can start on Monday."',
    intermediate: 'Say "I can" or "I am able to", not both.',
    advanced: 'Redundant modal: use "can" or "be able to", not both.' } },
  { re: /\bthanks you\b/i, fix: 'thank you', note: {
    beginner: 'Say "thank you" or "thanks". Example: "Thank you for your time."',
    intermediate: 'Say "thank you" or "thanks".',
    advanced: 'Mixed forms: "thank you" (verb) or "thanks" (noun).' } },
  { re: /\bhow much it cost\b/i, fix: 'how much it costs', note: {
    beginner: 'Add "s" to "cost" after "it". Example: "It costs 500 dollars."',
    intermediate: 'Add "s": it costs.',
    advanced: 'Third-person singular present: "it costs".' } },
  { re: /\bdepend of\b/i, fix: 'depend on', note: {
    beginner: 'Say "depend on", not "depend of". Example: "The price depends on the pages."',
    intermediate: 'In English we say "depend on".',
    advanced: 'Fixed preposition: "depend on".' } }
];

// The two checks that are not word rules, with the same 3 levels
const CAPITAL_NOTE = {
  beginner: 'Start with a big letter. Example: "Hello Adjoa."',
  intermediate: 'Start your message with a capital letter.',
  advanced: 'Sentences begin with a capital letter.'
};
const ENDING_NOTE = {
  beginner: 'Put a full stop (.) or a question mark (?) at the end.',
  intermediate: 'End your message with a full stop or a question mark.',
  advanced: 'Missing terminal punctuation.'
};

// Returns up to 4 corrections: [{ wrong, right, note }]
// checkEnding: also ask for a full stop at the end (off for drafts that end with a signature)
// level: 'beginner' | 'intermediate' | 'advanced' – picks the explanation wording only
export function checkEnglish(text, { checkEnding = true, level = 'intermediate' } = {}) {
  const english = [];
  ENGLISH_RULES.forEach(rule => {
    const m = text.match(rule.re);
    if (m && english.length < 4) {
      english.push({ wrong: m[0].trim(), right: m[0].replace(rule.re, rule.fix).trim(), note: rule.note[level] });
    }
  });
  if (/^[a-z]/.test(text.trim()) && english.length < 4) {
    const first = text.trim().split(/\s+/)[0];
    english.push({ wrong: first, right: first[0].toUpperCase() + first.slice(1), note: CAPITAL_NOTE[level] });
  }
  if (checkEnding && !/[.!?)]$/.test(text.trim()) && english.length < 4) {
    english.push({ wrong: '…' + text.trim().slice(-14), right: '…' + text.trim().slice(-14) + '.', note: ENDING_NOTE[level] });
  }
  return english;
}
