// Tests for the simulated coach in js/coach.js. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeReply, scoreLabel } from '../js/coach.js';
import { SCENARIOS } from '../js/data.js';

const scenario = (id) => SCENARIOS.find(s => s.id === id);
// Coach one reply, as if it was your only reply in the session
const coach = (id, text) => analyzeReply(text, { scenario: scenario(id), yourReplies: [text] });

test('the example on the landing page gives the score shown there', () => {
  const f = coach('bakery', 'Hi Adjoa, thank you for contacting me! Which pages do you need, and when should it be ready?');
  assert.equal(f.score, 75); // index.html shows 75: update both if the formula changes
  assert.ok(f.good.includes('You covered 2 of 5 key topics'));
  assert.ok(f.forgotten.includes('Her budget'));
});

test('a strong reply scores high and covers every topic', () => {
  const f = coach('bakery', 'Good morning Adjoa, thank you for contacting me. I would love to help. Which pages do you need? Should customers order and pay online? What budget do you have in mind, and when should the website be ready? Do you already have a logo and photos? Could we schedule a short call this week?');
  assert.ok(f.score >= 80, `score was ${f.score}`);
  assert.equal(scoreLabel(f.score), 'Strong reply');
  assert.deepEqual(f.forgotten, []);
  assert.equal(f.skills.questions, 100);
});

test('slang and missing politeness give tips and a low score', () => {
  const f = coach('bakery', 'ok u wanna price?');
  assert.ok(f.score < 60, `score was ${f.score}`);
  assert.ok(f.prof.some(p => p.text.includes('chat slang')));
  assert.ok(f.english.some(e => e.right === 'you'));
});

test('giving a price before asking questions is a warning (bakery)', () => {
  const f = coach('bakery', 'Hello Adjoa, thank you. A website like this costs $300.');
  assert.equal(f.skills.tricky, 40);
  assert.ok(f.prof.some(p => p.text.includes('gave a price')));
});

test('the complaint scenario expects an apology', () => {
  const noSorry = coach('complaint', 'Hello, thank you for telling me. I will check the form today.');
  const sorry = coach('complaint', 'Hello, I am so sorry. Thank you for telling me. I will check the form today.');
  assert.ok(noSorry.prof.some(p => p.text.includes('saying sorry')));
  assert.ok(!sorry.prof.some(p => p.text.includes('saying sorry')));
});

test('questions asked in earlier replies still count', () => {
  const earlier = 'What budget do you have in mind?';
  const latest = 'Thank you. When do you need it?';
  const f = analyzeReply(latest, { scenario: scenario('bakery'), yourReplies: [earlier, latest] });
  assert.ok(!f.forgotten.includes('Her budget'));
});

test('the score always stays between 20 and 97', () => {
  const replies = [
    'k',
    'WHY!!! u gonna pay???',
    'Good morning, thank you so much! ' + 'Which pages, budget, date, logo, order online? '.repeat(3)
  ];
  for (const s of SCENARIOS) {
    for (const text of replies) {
      const { score } = coach(s.id, text);
      assert.ok(score >= 20 && score <= 97, `${s.id}: ${score}`);
    }
  }
});

test('score labels change at 60 and 80', () => {
  assert.equal(scoreLabel(59), 'Needs work');
  assert.equal(scoreLabel(60), 'Good start');
  assert.equal(scoreLabel(79), 'Good start');
  assert.equal(scoreLabel(80), 'Strong reply');
});
