# Static Browser Game Generator

The live site is a **studio**:

- Right side: the published game (`game.html`)
- Left side: generate a new game in the browser with the visitor's own DeepSeek key

Generated games in the browser stay on that visitor's machine unless you publish through Actions.

Site: https://tbenitz.github.io/static-browser-game-generator/

## Why Actions looked like it ignored your idea

The workflow *did* receive your text. The second run used:

`tic tac toe, human versus ai with score keeping`

and wrote Neon Tic-Tac-Toe. Two things made that feel wrong:

1. The Actions form used to ship with a default neon hover-craft prompt. If that default is left in the box, you get the neon arena.
2. The model was copying the neon look from the starter demo even when you asked for something else.

That is fixed. The form default is now empty, the job prints the exact idea it will send, and it refuses to run if the box is blank. The published file is `game.html` so generating no longer wipes the studio page. Each run writes `artifacts/last-run.json` so you can see the idea that was used.

## Generate on the site

1. Open the Pages URL.
2. Play the published game on the right.
3. Type a new idea on the left.
4. Paste **your** DeepSeek key. Optional: remember it in this browser only.
5. Click **Generate in this browser**.

The new game loads in the iframe. It does **not** change the public site. Download the HTML if you want a copy.

If the browser is blocked by CORS, use Actions instead.

Do not put the repo secret into the website. Visitors use their own keys. Your `DEEPSEEK_API_KEY` Actions secret stays on GitHub.

## Publish a game for everyone (Actions)

1. Repo **Settings → Secrets and variables → Actions** must contain `DEEPSEEK_API_KEY`.
2. **Actions → Generate Game → Run workflow**.
3. Type the game you want. Do not leave the box empty.
4. The job overwrites `game.html`, commits it, and Pages updates.

## Local generate

```bash
cp .env.example .env
set -a && source .env && set +a
node scripts/generate.mjs "first person bowling, 10 pins, keep score"
npx serve .
```

## Security

| Place | API key allowed? |
| --- | --- |
| `game.html` / published JS | No |
| GitHub Actions secret `DEEPSEEK_API_KEY` | Yes (owner publish) |
| Visitor's browser field / localStorage | Yes (their key, their machine) |
| Committed `.env` | No |
