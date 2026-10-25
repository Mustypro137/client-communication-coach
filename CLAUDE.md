# Client Communication Coach

A web app that helps freelance developers practise client conversations, improve their professional English, and draft WhatsApp and LinkedIn messages.

## Tech
- Plain HTML, CSS and JavaScript. No framework, no build step.
- `index.html` – page structure (6 screens, one `<section data-screen="...">` each)
- `style.css` – all styles. Colours and fonts are CSS variables in `:root` (light and dark theme).
- `js/` – the logic, as ES modules. `index.html` loads only `js/main.js`, which imports the rest:
  - `utils.js` – icons, `$`, `escapeHTML`, toast, copy to clipboard
  - `data.js` – sample scenarios, phrases and progress numbers
  - `state.js` – the one shared `state` object
  - `dashboard.js`, `practice.js`, `studio.js`, `phrasebook.js` – one file per screen
  - `main.js` – navigation, progress, settings and app start-up
- Modules don't load from `file://`. Run a local server (e.g. `python -m http.server`) and open http://localhost:8000.

## Rules
- Keep the "Clarity" design: ivory background #F7F7F4, navy text #243B53, blue accent #6487C4, sage green only for the coach panel.
- Use the existing CSS variables. Do not hard-code new colours.
- Keep code simple and commented. The owner is a self-taught developer and must be able to read every line.
- The AI is simulated. `analyzeReply()` (coach) and `generateDraft()` (Message Studio) are the only places to change when connecting a real AI.
- Never put API keys in front-end code. A real AI must go through a small server.
- Messages are never sent automatically to WhatsApp or LinkedIn. The user copies them.
- Test at desktop width and at 375px phone width after every change.
