# Client Communication Coach

A web app that helps freelance developers practise client conversations, improve their professional English, and draft WhatsApp and LinkedIn messages.

## Tech
- Plain HTML, CSS and JavaScript. No framework, no build step.
- `index.html` – the landing page for new visitors (no app logic; it only loads the icons from `utils.js`)
- `app.html` – the app's page structure (8 screens, one `<section data-screen="...">` each; "results" opens after End session)
- `style.css` – all styles. Colours and fonts are CSS variables in `:root` (light and dark theme).
- `js/` – the logic, as ES modules. `app.html` loads only `js/main.js`, which imports the rest:
  - `utils.js` – icons, `$`, `escapeHTML`, toast, copy to clipboard
  - `data.js` – practice scenarios and phrases
  - `state.js` – the one shared `state` object
  - `progress.js` – saves practice sessions (`localStorage` key `ccc-progress`), streak/week/average calculations, Progress screen
  - `english.js` – grammar rules shared by the coach and Message Studio
  - `coach.js` – the simulated coach: `analyzeReply()` scores one reply (no screen code, so it can be tested)
  - `dashboard.js`, `practice.js`, `results.js`, `library.js`, `studio.js`, `phrasebook.js` – one file per screen
  - `main.js` – navigation, settings and app start-up
- `tests/` – automated tests for the logic (`english.js`, `coach.js`, `progress.js`). Run `npm test` in the project folder. Uses Node's built-in test runner, no packages.
- `server/` – optional Cloudflare Worker that calls Claude. **Not deployed and not connected to the app** (the browser side was removed after commit b7af28a). The key would be a Wrangler secret, never in a file. Run `npm test` there (fake Claude, free).
- Installable app (PWA): `manifest.webmanifest` (name, icons, colours), `sw.js` (service worker, network first: online files are always fresh, offline the saved copy is used), `icons/`, and `js/pwa.js` (registers `sw.js`, Install button on the landing page). **When you add a file, add it to `FILES` in `sw.js`**, or it won't work offline.
- Modules don't load from `file://`. Run a local server (e.g. `python -m http.server`) and open http://localhost:8000 (landing page) or http://localhost:8000/app.html (the app).

## Rules
- Keep the "Clarity" design: ivory background #F7F7F4, navy text #243B53, blue accent #6487C4, sage green only for the coach panel.
- Use the existing CSS variables. Do not hard-code new colours.
- Keep code simple and commented. The owner is a self-taught developer and must be able to read every line.
- The AI is simulated: `analyzeReply()` (coach.js), `generateDraft()` (Message Studio) and `checkEnglish()` (english.js) are simple rules. Label their results "Template-based" and never present them as real AI. If real AI is added later, it goes only through `server/`, falls back to the rules, and is labelled "Claude AI".
- Never save pasted client messages. The service worker saves only the app's own files and fonts. Only progress (`ccc-progress`), saved phrases (`ccc-saved`) and settings (`ccc-settings`) go in `localStorage`. The server must never log message text.
- Never put API keys in front-end code. A real AI must go through a small server.
- Messages are never sent automatically to WhatsApp or LinkedIn. The user copies them.
- Run `npm test` and test at desktop width and at 375px phone width after every change.
- Accessibility: text at least 4.5:1 contrast (in light and dark mode), buttons at least 44px tall on phones, a `<label>` for every form field. For screen-reader updates use `announce()` from utils.js, not `aria-live` on big areas that are re-drawn.
