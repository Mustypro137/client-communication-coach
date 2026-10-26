// Tests for the progress calculations in js/progress.js. Run with: npm test
// Every calculation takes the list of sessions (and "today"), so no browser storage is needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, streak, lastNDays, average, weekMinutes, latestFor, recommend, commonMistakes, mistakesToSave, exportData, mergeImport } from '../js/progress.js';
import { checkEnglish } from '../js/english.js';
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

test('commonMistakes counts the same mistake across sessions, most frequent first', () => {
  const list = [
    on('2026-10-27', { mistakes: [{ wrong: 'informations', right: 'information' }, { rule: 'capital' }] }),
    on('2026-10-28', { mistakes: [{ wrong: 'Informations', right: 'Information' }, { wrong: 'u', right: 'you' }] })
  ];
  const top = commonMistakes(list);
  assert.equal(top[0].wrong, 'informations');
  assert.equal(top[0].count, 2, 'capital letters do not make it a different mistake');
  assert.equal(top.length, 3);
  assert.equal(top.find(m => m.label).label, 'Capital letter at the start');
});

test('commonMistakes returns at most n, and old sessions without mistakes still work', () => {
  const many = ['a', 'b', 'c', 'd', 'e', 'f'].map(w => ({ wrong: w, right: w + 'x' }));
  assert.equal(commonMistakes([on('2026-10-28', { mistakes: many })]).length, 5);
  assert.deepEqual(commonMistakes([on('2026-10-28')]), []);
});

test('mistakesToSave keeps only the mistake, never the rest of your reply', () => {
  const reply = 'thanks for the informations Adjoa see you at the bakery';
  const saved = mistakesToSave(checkEnglish(reply));
  assert.deepEqual(saved, [{ wrong: 'informations', right: 'information' }, { rule: 'capital' }, { rule: 'ending' }]);
  assert.ok(!JSON.stringify(saved).includes('bakery'), 'no reply text is saved');
});

/* ---------- Export and import ---------- */
const skills = { tone: 70, questions: 60, english: 80, tricky: 100 };
const session = (id, extra = {}) => ({ id, date: '2026-10-28', scenarioId: 'bakery', replies: 2, score: 70, minutes: 5, skills, mistakes: [], ...extra });
// What JSON.stringify + JSON.parse do to the file (Sets become lists, etc.)
const throughFile = (obj) => JSON.parse(JSON.stringify(obj));

test('export, then import into an empty browser, gives back the same sessions and phrases', () => {
  const file = throughFile(exportData([session(1), session(2)], new Set(['Thank you.']), today));
  assert.equal(file.exported, '2026-10-28');
  const r = mergeImport([], new Set(), file);
  assert.deepEqual(r.sessions, [session(1), session(2)]);
  assert.deepEqual([...r.saved], ['Thank you.']);
  assert.equal(r.added, 2);
  assert.equal(r.addedPhrases, 1);
});

test('importing the same file twice adds nothing the second time', () => {
  const file = throughFile(exportData([session(1)], new Set(['Thank you.'])));
  const first = mergeImport([], new Set(), file);
  const second = mergeImport(first.sessions, first.saved, file);
  assert.equal(second.added, 0);
  assert.equal(second.addedPhrases, 0);
  assert.equal(second.sessions.length, 1);
});

test('import keeps the sessions already here and sorts everything oldest first', () => {
  const file = throughFile(exportData([session(1), session(3)], new Set()));
  const r = mergeImport([session(2)], new Set(['Mine.']), file);
  assert.deepEqual(r.sessions.map(s => s.id), [1, 2, 3]);
  assert.ok(r.saved.has('Mine.'));
});

test('a file from somewhere else is refused', () => {
  assert.ok(mergeImport([], new Set(), { sessions: [] }).error);
  assert.ok(mergeImport([], new Set(), null).error);
  assert.ok(mergeImport([], new Set(), { app: 'client-communication-coach', sessions: 'oops' }).error);
});

test('damaged sessions and phrases are skipped, the good ones still come in', () => {
  const file = {
    app: 'client-communication-coach', version: 1,
    sessions: [session(1), session(2, { score: 500 }), session(3, { date: 'yesterday' }), session(4, { skills: {} }), 'hello'],
    saved: ['Fine.', 42, 'x'.repeat(501)]
  };
  const r = mergeImport([], new Set(), file);
  assert.deepEqual(r.sessions.map(s => s.id), [1]);
  assert.deepEqual([...r.saved], ['Fine.']);
  assert.equal(r.skipped, 6);
});

test('import keeps only known fields, and only mistakes that look right', () => {
  const file = { app: 'client-communication-coach', sessions: [session(1, {
    note: '<img src=x onerror=alert(1)>',
    mistakes: [{ wrong: 'u', right: 'you' }, { rule: 'capital', wrong: 'hello Adjoa' }, { rule: 'nope' }, { wrong: 'x'.repeat(61), right: 'y' }]
  })] };
  const [s] = mergeImport([], new Set(), file).sessions;
  assert.equal(s.note, undefined, 'unknown fields are dropped');
  assert.deepEqual(s.mistakes, [{ wrong: 'u', right: 'you' }, { rule: 'capital' }]);
});
