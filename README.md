# Client Communication Coach

A web app that helps freelance developers practise client conversations, improve their professional English, and draft replies for WhatsApp and LinkedIn.

**Live demo:** https://mustypro137.github.io/client-communication-coach/ (landing page) · [open the app directly](https://mustypro137.github.io/client-communication-coach/app.html)

> **Prototype:** for visitors, the "AI" is simulated. Client replies are scripted, and the coach's feedback comes from simple, transparent rules (greeting, thanks, questions asked, common grammar mistakes). It does not understand every possible reply.
>
> **AI beta (owner only):** with a passcode, Message Studio's English check uses Claude (by Anthropic) through a small secure server. See [server/README.md](server/README.md).

## Features

- **Dashboard:** daily goal, streak, your stats, scenarios with your latest scores, and a recommended next exercise.
- **Practice with a Client:** seven realistic scenarios (new inquiry, discount request, late payment, extra scope, unrealistic deadline, complaint, follow-up after no reply). Chat with a simulated client, then get coaching on your English, tone, and the questions you forgot to ask. Try again as often as you like.
- **Scenario library:** all scenarios as cards, with the skill each one trains and your last score. Filter by level, or by new and practised.
- **Session results:** press End session to see your score (compared with last time), skill bars, the top 3 things to fix, and the recommended next scenario.
- **Message Studio:** paste a client message, choose a goal and tone, and get an editable, template-based draft. It explains why the draft works, lists questions to clarify, and can check your edited English.
- **Phrasebook:** professional phrases with plain-English meanings. Search, filter, copy and save your favourites.
- **Progress:** practice minutes this week, skill scores and session history, saved in your browser.
- **Settings:** daily goal, defaults, your English level (beginner explanations use simpler words and an example; advanced ones are short and use grammar terms), and a reset button for your progress.

Messages are **never sent automatically**. You copy the reply and send it yourself.

## Run it locally

The app uses ES modules, so it must be opened through a local server (double-clicking the HTML files will not work).

```bash
# Option 1: Python
python -m http.server
# then open http://localhost:8000 (landing page)
# or http://localhost:8000/app.html (the app)

# Option 2: VS Code
# install the "Live Server" extension and click "Go Live"
```

No install or build step is needed.

## Project structure

```
index.html        landing page for new visitors
app.html          the app: page structure (8 screens)
style.css         all styles; colours and spacing are CSS variables
js/
  main.js         entry point: navigation, settings, start-up
  utils.js        shared helpers (icons, toast, copy to clipboard)
  data.js         practice scenarios and phrases
  state.js        the shared app state
  progress.js     saved practice sessions, streak and Progress screen
  english.js      grammar rules shared by the coach and Message Studio
  dashboard.js    dashboard screen
  practice.js     practice chat and the simulated coach
  results.js      session results screen
  library.js      scenario library screen
  studio.js       Message Studio templates
  phrasebook.js   phrasebook screen
  ai.js           talks to the AI server (no API key here)
server/           small Cloudflare Worker that calls Claude; the API key is a secret there
```

## Privacy

- No accounts, no tracking. For visitors, nothing leaves the browser (the AI server is used only with the owner's passcode).
- Practice progress, saved phrases and settings are stored in your browser's `localStorage`. This is **not** encrypted, so don't store sensitive information. You can reset your progress in Settings.
- Pasted client messages are never saved.
- With the AI beta on (owner only), the text you check is sent to Anthropic to be processed. The server does not log it, and the app does not save it.

## Built with

HTML, CSS and vanilla JavaScript. No frameworks or dependencies.

## Roadmap

- AI for the coach and for Message Studio drafts, through the same server (the English check is done).
