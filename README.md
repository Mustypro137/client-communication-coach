# Client Communication Coach

A web app that helps freelance developers practise client conversations, improve their professional English, and draft replies for WhatsApp and LinkedIn.

> **Prototype:** the "AI" is simulated. Client replies are scripted, and the coach's feedback comes from simple, transparent rules (greeting, thanks, questions asked, common grammar mistakes). It does not understand every possible reply.

## Features

- **Dashboard:** daily goal, quick stats, recent scenarios and useful phrases.
- **Practice with a Client:** chat with a simulated client, then get coaching on your English, tone, and the questions you forgot to ask. Try again as often as you like.
- **Message Studio:** paste a client message, choose a goal and tone, and get an editable draft with an explanation of why it works.
- **Phrasebook:** professional phrases with plain-English meanings. Search, filter, copy and save your favourites.
- **Progress** and **Settings** screens.

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
  main.js         entry point: navigation, progress, settings, start-up
  utils.js        shared helpers (icons, toast, copy to clipboard)
  data.js         sample scenarios and phrases
  state.js        the shared app state
  dashboard.js    dashboard screen
  practice.js     practice chat and the simulated coach
  studio.js       Message Studio templates
  phrasebook.js   phrasebook screen
```

## Privacy

- No accounts, no backend, no tracking.
- Saved phrases and settings are stored in your browser's `localStorage`. This is **not** encrypted, so don't store sensitive information.
- Pasted client messages are not saved.

## Built with

HTML, CSS and vanilla JavaScript. No frameworks or dependencies.

## Roadmap

- Two more practice scenarios (unrealistic deadline, complaint) and a follow-up after no response.
- Save real practice progress instead of sample data.
- Later: a real AI model through a small, secure server (API keys stay on the server, never in the browser).
