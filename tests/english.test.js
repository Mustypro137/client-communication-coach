// Tests for the grammar rules in js/english.js. Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkEnglish } from '../js/english.js';

test('correct English gives no corrections', () => {
  assert.deepEqual(checkEnglish('Hello Adjoa, thank you for your message. I can help.'), []);
});

test('finds a common mistake and suggests the fix', () => {
  const [fix] = checkEnglish('Thanks for the informations.');
  assert.equal(fix.wrong, 'informations');
  assert.equal(fix.right, 'information');
});

test('keeps the number when "since" should be "for"', () => {
  const [fix] = checkEnglish('I have worked as a developer since 3 years.');
  assert.equal(fix.right, 'for 3 years');
});

test('a small "i" is corrected, but "i" inside a word is not', () => {
  assert.equal(checkEnglish('Yes, i can start today.')[0].right, 'I');
  assert.deepEqual(checkEnglish('This is a big idea.'), []);
});

test('new rules: common mistakes in client messages', () => {
  const fix = (text) => checkEnglish(text)[0];
  assert.equal(fix('I will revert back to you.').right, 'reply to you');
  assert.equal(fix('Please explain me the plan.').right, 'explain to me');
  assert.equal(fix('I have a doubt about the price.').right, 'have a question');
  assert.equal(fix('We can talk on tomorrow.').right, 'tomorrow');
  assert.equal(fix("It don't work.").right, "It doesn't"); // keeps the capital letter
});

test('correct uses of the same words are not flagged', () => {
  assert.deepEqual(checkEnglish('Please revert the change I made.'), []); // "revert" = go back to an old version
  assert.deepEqual(checkEnglish('Can you explain it to me?'), []);
  assert.deepEqual(checkEnglish('There is no doubt that we can finish on Monday.'), []);
  assert.deepEqual(checkEnglish("They don't need a blog."), []);
});

test('asks for a capital letter at the start and a full stop at the end', () => {
  const fixes = checkEnglish('hello Adjoa');
  assert.equal(fixes[0].right, 'Hello');
  assert.ok(fixes[1].right.endsWith('.'));
});

test('checkEnding: false skips the full stop check (for drafts with a signature)', () => {
  assert.deepEqual(checkEnglish('Hello Adjoa\n\nBest regards,\nMusty', { checkEnding: false }), []);
});

test('never returns more than 4 corrections', () => {
  const fixes = checkEnglish('i wanna discuss about ur informations and advices pls');
  assert.equal(fixes.length, 4);
});

test('the English level changes the explanation, not the correction', () => {
  const beginner = checkEnglish('Thanks for the informations.', { level: 'beginner' })[0];
  const advanced = checkEnglish('Thanks for the informations.', { level: 'advanced' })[0];
  assert.equal(beginner.right, advanced.right);
  assert.notEqual(beginner.note, advanced.note);
  assert.match(beginner.note, /Example:/); // beginner notes always show an example
});
