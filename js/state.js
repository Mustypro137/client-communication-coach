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
  sessionsToday: 1,
  countedThisSession: false,
  dailyGoal: 3,
  studio: { platform: 'whatsapp', draft: '', original: '', reasons: [] },
  pb: { query: '', cat: 'all' },
  saved: new Set(),
  showExplanations: true  // Settings: show grammar explanations in the coach
};
