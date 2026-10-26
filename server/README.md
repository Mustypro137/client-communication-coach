# AI server (optional, not deployed)

> **Status:** this server is a finished, tested example, but it is **not deployed and not connected to the app**. The live app uses only its simple rules. The browser side that called it (`js/ai.js`, the passcode in Settings, the AI English check in Message Studio) was removed after commit `b7af28a`. To turn it on again, restore those files from that commit, then follow the setup below.

A small [Cloudflare Worker](https://developers.cloudflare.com/workers/) that lets the app use Claude (by Anthropic) **without putting the API key in the browser**.

```
Browser (GitHub Pages) ──► this server (holds the key) ──► Claude
```

- The API key and the passcode are **secrets** stored by Cloudflare. They are never written in any file.
- Only the websites listed in `wrangler.toml` (`ALLOWED_ORIGINS`) may call it, and only with the right passcode.
- If anything fails, the app quietly uses its simple rules instead.
- The server logs token counts only, never the text people check.

Routes so far: `POST /english` (English check in Message Studio).

## One-time setup

You need: an Anthropic account with credits ([console.anthropic.com](https://console.anthropic.com)) and a free Cloudflare account.

1. **Set a spending limit** in the Anthropic Console (Settings → Limits). This is your safety net.
2. Create an API key in the Anthropic Console. Keep it private.
3. In a terminal, inside this `server` folder:

```bash
npm install                                # once
npx wrangler login                         # opens the browser to log in to Cloudflare
npx wrangler secret put ANTHROPIC_API_KEY  # paste your Anthropic key when asked
npx wrangler secret put APP_PASSCODE       # choose a passcode for the app's Settings
npx wrangler deploy                        # prints your server address
```

4. Copy the address it prints (like `https://client-coach-ai.<your-name>.workers.dev`) into `AI_URL` in `../js/ai.js` (restored from `b7af28a`), then commit and push.
5. In the live app, open **Settings → AI feedback**, type your passcode and press **Save settings**.

## Local testing

Create a file `server/.dev.vars` (it is in `.gitignore`, never commit it):

```
ANTHROPIC_API_KEY="your key"
APP_PASSCODE="any passcode"
```

Then run `npm run dev` here (server on http://127.0.0.1:8799). With the browser side restored, run `python -m http.server` in the project folder (app on http://localhost:8000) and the app uses the local server automatically.

## Useful commands

```bash
npm test          # server tests with a fake Claude: free, no key needed
npx wrangler tail # live logs of the deployed server (token counts, errors)
```

## Cost

Model: Claude Opus 5.5 ($4 per million input tokens, $20 per million output tokens). Check the real token counts with `npx wrangler tail` after a few English checks.
