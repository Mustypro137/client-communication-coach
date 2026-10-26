// Checks every practice scenario in js/data.js, so a new scenario can't be added half-finished.
// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS } from '../js/data.js';
import { analyzeReply } from '../js/coach.js';

test('scenario ids are unique', () => {
  const ids = SCENARIOS.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
});

for (const s of SCENARIOS) {
  test(`${s.id}: every field is filled in`, () => {
    for (const field of ['title', 'client', 'initials', 'role', 'avatarBg', 'skill', 'objective', 'modelReply']) {
      assert.ok(typeof s[field] === 'string' && s[field].trim(), `${field} is missing`);
    }
    assert.ok([1, 2, 3].includes(s.level), 'level must be 1, 2 or 3');
    assert.ok(s.opening.length > 0, 'the client needs an opening message');
    assert.equal(s.followUps.length, 3, 'the client needs 3 follow-up answers');
    assert.ok(s.checks.length >= 3, 'at least 3 key topics');
    for (const c of s.checks) assert.ok(c.label && c.words.length, 'each topic needs a label and keywords');
    // Keywords are compared with your reply in lower case, so they must be lower case too
    for (const c of s.checks) for (const w of c.words) assert.equal(w, w.toLowerCase(), `keyword "${w}" must be lower case`);
  });

  test(`${s.id}: the suggested improved reply is good by the coach's own rules`, () => {
    const f = analyzeReply(s.modelReply, { scenario: s, yourReplies: [s.modelReply] });
    assert.ok(f.score >= 80, `score was ${f.score}`);
    assert.deepEqual(f.english, [], 'no grammar corrections');
    assert.equal(f.skills.tricky, 100, 'no warnings for the tricky moment');
  });
}
