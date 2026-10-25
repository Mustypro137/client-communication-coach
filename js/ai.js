import { state } from './state.js';

/* =========================================================
   AI — talks to our small server (the server folder), which calls Claude.
   There is NO API key here: the key lives only on the server.
   Without a passcode (or if the server fails), the app uses its simple rules.
   ========================================================= */
const LOCAL = ['localhost', '127.0.0.1'].includes(location.hostname);

// Where the AI server runs. Local testing uses `npm run dev` in the server folder.
// After deploying, paste your Worker's address between the quotes (it is not a secret).
export const AI_URL = LOCAL ? 'http://127.0.0.1:8799' : '';

// AI is used only when a server address is set and you have entered your passcode in Settings
export const aiReady = () => Boolean(AI_URL && state.aiPasscode);

// Send a request to one AI route, e.g. askAI('/english', { text, level }).
// Throws an Error with a readable message when anything goes wrong; callers then use the rules.
export async function askAI(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000); // give up after 30 seconds
  try {
    const res = await fetch(AI_URL + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Coach-Passcode': state.aiPasscode },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `AI server error (${res.status}).`);
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The AI took too long to answer.');
    if (err instanceof TypeError) throw new Error('Could not reach the AI server.'); // offline, wrong address, or blocked
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
