// Tests for the progress calculations in js/progress.js. Run with: npm test
// Every calculation takes the list of sessions (and "today"), so no browser storage is needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, streak, lastNDays, average, weekMinutes, latestFor, recommend } from '../js/progress.js';
import { SCENARIOS } from '../js/data.js';

const today = new Date(2026, 9, 28); // Wednesday 28 October 2026 (months start at 0)
const on = (date, extra = {}) => ({ date, scenarioId: 'bakery', score: 70, minutes: 5, ...extra });

test('dayKey writes a date as YYYY-MM-DD', () => {
  assert.equal(dayKey(new Date(2026, 0, 5)), '2026-01-05');
});

test('streak counts days in a row', () => {
  assert.equal(streak([on('2026-10-28'), on('2026-10-27'), on('2026-10-26')], today), 3);
  assert.equal(streak([on('2026-10-28'), on('2026-10-26')], today), 1, 'a missed day breaks the streak');
  assert.equal(streak([], today), 0);
});

test('practising yesterday but not yet today keeps the streak', () => {
  assert.equal(streak([on('2026-10-27'), on('2026-10-26')], today), 2);
  assert.equal(streak([on('2026-10-26')], today), 0, 'two days ago is too late');
});

test('streak works across the end of a month', () => {
  assert.equal(streak([on('2026-11-01'), on('2026-10-31')], new Date(2026, 10, 1)), 2);
});

test('lastNDays keeps only the last n days, today included', () => {
  const list = [on('2026-10-28'), on('2026-10-22'), on('2026-10-21')];
  assert.equal(lastNDays(list, 7, today).length, 2);
});

test('average rounds, and is null for no numbers', () => {
  assert.equal(average([70, 81]), 76);
  assert.equal(average([]), null);
});

test('weekMinutes adds up minutes per day, Monday to Sunday', () => {
  const list = [
    on('2026-10-26', { minutes: 5 }),
    on('2026-10-26', { minutes: 3 }),
    on('2026-11-01', { minutes: 4 }),
    on('2026-10-25', { minutes: 9 }) // the Sunday before: last week
  ];
  assert.deepEqual(weekMinutes(list, today), [8, 0, 0, 0, 0, 0, 4]);
});

test('latestFor finds your most recent session of one scenario', () => {
  const list = [on('2026-10-20', { score: 50 }), on('2026-10-21', { scenarioId: 'payment' }), on('2026-10-22', { score: 80 })];
  assert.equal(latestFor(list, 'bakery').score, 80);
  assert.equal(latestFor(list, 'complaint'), null);
});

test('recommend picks an untried scenario first, then your lowest latest score', () => {
  assert.equal(recommend([]).scenario.id, SCENARIOS[0].id);
  const all = SCENARIOS.map((s, i) => on('2026-10-20', { scenarioId: s.id, score: 90 - i }));
  all.push(on('2026-10-21', { scenarioId: 'payment', score: 40 }));
  assert.equal(recommend(all).scenario.id, 'payment');
  assert.equal(recommend(all).score, 40);
});
