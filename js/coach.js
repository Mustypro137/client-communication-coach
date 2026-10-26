import { checkEnglish } from './english.js';

/* =========================================================
   THE SIMULATED COACH — rule-based feedback on one reply (no real AI)
   No screen code here, so it can be tested on its own (tests/coach.test.js).
   ========================================================= */
const SLANG = /\b(u|ur|pls|plz|wanna|gonna|bro|lol|k|thx)\b/i;

// scenario: the scenario from data.js · yourReplies: all your replies in this session, as text
// (forgotten questions are checked across all of them) · level: English level for the notes
export function analyzeReply(text, { scenario: s, yourReplies, level = 'intermediate' }) {
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
  const offersReward = s.id === 'review' && /\b(5|five)[ -]?stars?\b|\b(discount|gift|reward)\b/i.test(text);
  const vagueDate = s.id === 'delay' && /\b(soon|asap|as soon as possible)\b/i.test(text) && !/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|\d+)\b/i.test(text);
  const blamesOthers = s.id === 'delay' && /\b(not my fault|their fault|your fault)\b/i.test(text);
  const yesAnyway = s.id === 'decline' && /\b(yes|sure|ok|okay|no problem)\b/i.test(text) && !/(\bbut\b|can't|cannot|not possible|not realistic|instead|smaller)/i.test(text);
  const rude = s.id === 'decline' && /\b(ridiculous|joke|crazy|stupid)\b/i.test(text);
  const warned = givesPriceEarly || agreesDiscount || freeWork || rushYes || noApology || blames || pushy || offersReward || vagueDate || blamesOthers || yesAnyway || rude;
  const shouting = /!{2,}/.test(text) || /\b[A-Z]{4,}\b/.test(text);

  // English corrections (shared rules in english.js)
  const english = checkEnglish(text, { level });

  // Professionalism notes
  const prof = [];
  const firstName = s.client.split(' ')[0];                // "Adjoa Mensah" → "Adjoa"
  const youWroteFirst = s.opening.some(l => l.from === 'you'); // e.g. the follow-up scenario
  prof.push(hasGreeting ? { type: 'good', text: 'You opened with a greeting, so the reply feels warm.' } : { type: 'tip', text: `Start with a greeting and the client's name, e.g. "Good morning, ${firstName}".` });
  if (!hasThanks) prof.push({ type: 'tip', text: youWroteFirst ? 'Thank the client for their time. It sets a positive tone.' : 'Thank the client for contacting you. It sets a positive tone.' });
  if (words < 15) prof.push({ type: 'tip', text: 'Your reply is very short. The client may feel you are in a hurry.' });
  if (words > 170) prof.push({ type: 'tip', text: 'Your reply is long for a chat. Try to keep it under 120 words.' });
  if (SLANG.test(text)) prof.push({ type: 'tip', text: 'Avoid chat slang with clients. Full words look more professional.' });
  if (shouting) prof.push({ type: 'tip', text: 'Avoid "!!!" and words in capital letters. They can feel like shouting.' });
  if (givesPriceEarly) prof.push({ type: 'tip', text: 'You gave a price before you understood the project. Ask questions first, then quote.' });
  if (agreesDiscount) prof.push({ type: 'tip', text: 'You accepted a 33% discount quickly. Offer a smaller scope instead, so your price stays fair.' });
  if (freeWork) prof.push({ type: 'tip', text: 'You agreed to new work without mentioning the cost. Extra work needs its own quote.' });
  if (rushYes) prof.push({ type: 'tip', text: 'You said yes to a very short deadline with no conditions. Offer a smaller first version or a realistic date.' });
  if (noApology) prof.push({ type: 'tip', text: 'Start by saying sorry. The client is losing money, so show that you understand.' });
  if (blames) prof.push({ type: 'tip', text: 'Avoid blaming the client. Focus on finding and fixing the problem.' });
  if (pushy) prof.push({ type: 'tip', text: 'This sounds like pressure. Remind the client kindly and make it easy to reply.' });
  if (offersReward) prof.push({ type: 'tip', text: 'Ask for an honest review. Offering a reward or asking for 5 stars breaks the rules of most review sites and hurts trust.' });
  if (vagueDate) prof.push({ type: 'tip', text: 'Give a clear new date. "Soon" makes the client worry more.' });
  if (blamesOthers) prof.push({ type: 'tip', text: 'Explain the reason without blaming anyone. Focus on the new plan.' });
  if (yesAnyway) prof.push({ type: 'tip', text: "You said yes to a project you can't deliver for this price and time. A polite no protects you both." });
  if (rude) prof.push({ type: 'tip', text: 'Avoid words like "ridiculous" or "crazy". Explain the facts politely.' });
  prof.push(hasNextStep ? { type: 'good', text: 'You suggested a clear next step.' } : { type: 'tip', text: 'End with a next step: a call, a quote, or a date.' });

  // Questions forgotten — checked across ALL your replies in this session
  const allYou = yourReplies.join(' ').toLowerCase();
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
  score -= warned ? 12 : 0;
  score = Math.max(20, Math.min(97, score));

  // Skill scores (0–100) for the Progress screen
  const skills = {
    tone: Math.max(0, 100 - (hasGreeting ? 0 : 25) - (hasThanks ? 0 : 15) - (SLANG.test(text) ? 20 : 0) - (shouting ? 20 : 0) - (hasNextStep ? 0 : 15)),
    questions: Math.round((asked / s.checks.length) * 100),
    english: Math.max(0, 100 - 20 * english.length),
    tricky: warned ? 40 : 100
  };

  return { score, good, english, prof, forgotten, model: s.modelReply, skills };
}

export function scoreLabel(n) { return n >= 80 ? 'Strong reply' : n >= 60 ? 'Good start' : 'Needs work'; }
