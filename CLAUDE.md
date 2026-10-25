# Client Communication Coach

A web app that helps freelance developers practise client conversations, improve their professional English, and draft WhatsApp and LinkedIn messages.

## Tech
- Plain HTML, CSS and JavaScript. No framework, no build step.
- `index.html` – page structure (7 screens, one `<section data-screen="...">` each; "results" opens after End session)
- `style.css` – all styles. Colours and fonts are CSS variables in `:root` (light and dark theme).
- `js/` – the logic, as ES modules. `index.html` loads only `js/main.js`, which imports the rest:
  - `utils.js` – icons, `$`, `escapeHTML`, toast, copy to clipboard
  - `data.js` – practice scenarios and phrases
  - `state.js` – the one shared `state` object
  - `progress.js` – saves practice sessions (`localStorage` key `ccc-progress`), streak/week/average calculations, Progress screen
  - `english.js` – grammar rules shared by the coach and Message Studio
  - `dashboard.js`, `practice.js`, `results.js`, `studio.js`, `phrasebook.js` – one file per screen
  - `main.js` – navigation, settings and app start-up
- Modules don't load from `file://`. Run a local server (e.g. `python -m http.server`) and open http://localhost:8000.

## Rules
- Keep the "Clarity" design: ivory background #F7F7F4, navy text #243B53, blue accent #6487C4, sage green only for the coach panel.
- Use the existing CSS variables. Do not hard-code new colours.
- Keep code simple and commented. The owner is a self-taught developer and must be able to read every line.
- The AI is simulated. `analyzeReply()` (coach), `generateDraft()` (Message Studio) and `checkEnglish()` (english.js) are the only places to change when connecting a real AI.
- Never save pasted client messages. Only progress (`ccc-progress`), saved phrases (`ccc-saved`) and settings (`ccc-settings`) go in `localStorage`.
- Never put API keys in front-end code. A real AI must go through a small server.
- Messages are never sent automatically to WhatsApp or LinkedIn. The user copies them.
- Test at desktop width and at 375px phone width after every change.
