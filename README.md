# Client Communication Coach

A web app that helps freelance developers practise client conversations, improve their professional English, and draft replies for WhatsApp and LinkedIn.

**Live demo:** https://mustypro137.github.io/client-communication-coach/

> **Prototype:** the "AI" is simulated. Client replies are scripted, and the coach's feedback comes from simple, transparent rules (greeting, thanks, questions asked, common grammar mistakes). It does not understand every possible reply.

## Features

- **Dashboard:** daily goal, streak, your stats, scenarios with your latest scores, and a recommended next exercise.
- **Practice with a Client:** seven realistic scenarios (new inquiry, discount request, late payment, extra scope, unrealistic deadline, complaint, follow-up after no reply). Chat with a simulated client, then get coaching on your English, tone, and the questions you forgot to ask. Try again as often as you like.
- **Message Studio:** paste a client message, choose a goal and tone, and get an editable, template-based draft. It explains why the draft works, lists questions to clarify, and can check your edited English.
- **Phrasebook:** professional phrases with plain-English meanings. Search, filter, copy and save your favourites.
- **Progress:** practice minutes this week, skill scores and session history, saved in your browser.
- **Settings:** daily goal, defaults, your English level (beginner explanations use simpler words and an example; advanced ones are short and use grammar terms), and a reset button for your progress.

Messages are **never sent automatically**. You copy the reply and send it yourself.

## Run it locally

The app uses ES modules, so it must be opened through a local server (double-clicking `index.html` will not work).

```bash
# Option 1: Python
python -m http.server
# then open http://localhost:8000

# Option 2: VS Code
# install the "Live Server" extension and click "Go Live"
```

No install or build step is needed.

## Project structure

```
index.html        page structure (6 screens)
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
  studio.js       Message Studio templates
  phrasebook.js   phrasebook screen
```

## Privacy

- No accounts, no backend, no tracking.
- Practice progress, saved phrases and settings are stored in your browser's `localStorage`. This is **not** encrypted, so don't store sensitive information. You can reset your progress in Settings.
- Pasted client messages are never saved.

## Built with

HTML, CSS and vanilla JavaScript. No frameworks or dependencies.

## Roadmap

- Later: a real AI model through a small, secure server (API keys stay on the server, never in the browser).
