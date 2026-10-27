/* The one shared state object. Every module imports it from here. */

/* =========================================================
   3. APP STATE — everything that changes lives here
   ========================================================= */
export const state = {
  screen: 'dashboard',
  scenarioId: 'bakery',
  messages: [],        // { from: 'client' | 'you', text, time }
  replyCount: 0,
  feedback: null,
  ended: false,
  clientTyping: false,
  clockMinutes: 9 * 60 + 41,
  sessionId: null,     // set by your first reply; used to save this session to your progress
  sessionStart: 0,     // when the scenario was opened (ms), to count practice minutes
  sessionMistakes: [], // the coach's English corrections in this session (see mistakesToSave in progress.js)
  dailyGoal: 3,
  studio: { platform: 'whatsapp', draft: '', original: '', reasons: [] },
  pb: { query: '', cat: 'all' },
  lib: { level: 'all', status: 'all' },  // Scenario library filters
  saved: new Set(),
  showExplanations: true,       // Settings: show grammar explanations in the coach
  englishLevel: 'intermediate', // Settings: how simply grammar is explained (english.js)
  aiPasscode: ''                // Settings: unlocks the AI server (ai.js); empty = simple rules only
};
