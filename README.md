# Static Browser Game Generator

Pipeline that turns a game idea into **one file**: `index.html`.

That file is a self-contained Babylon.js 3D game. It runs from `file://`, from `npx serve`, and on GitHub Pages. No textures, models, or sound files. No backend in the published game.

This repo already contains a playable demo (`Orb Drift`) so Pages works before you generate anything.

## What stays secret

The DeepSeek API key is **only** used by the generator (your laptop or GitHub Actions).

It is **never** written into `index.html`. GitHub Pages is a static host. Anything in that HTML is public. Putting `sk-...` in frontend JavaScript would leak the key to every visitor.

| Place | Put the key here? |
| --- | --- |
| `index.html` / any JS that ships to Pages | No |
| Git commit, README, issue, screenshot | No |
| Local `.env` (gitignored) | Yes |
| Repo **Settings → Secrets and variables → Actions** | Yes |

## 1. Enable GitHub Pages

1. Open the repo on GitHub.
2. **Settings → Pages**.
3. Source: **GitHub Actions**.
4. Push to `main` (already done if you are looking at this README) or run the **Deploy GitHub Pages** workflow.
5. The live game is:

`https://tbenitz.github.io/static-browser-game-generator/`

Project Pages use a subpath. The demo game only uses CDNs + one HTML file, so that is fine.

## 2. Add the DeepSeek key securely (required to generate new games)

1. Create a key at [DeepSeek Platform](https://platform.deepseek.com/).
2. In this repo: **Settings → Secrets and variables → Actions → New repository secret**.
3. Name (exact): `DEEPSEEK_API_KEY`
4. Value: your key. Save.

That secret is encrypted at rest. It is injected only into the generate job as `env.DEEPSEEK_API_KEY`. It does not appear in the workflow file, in `index.html`, or on Pages.

There is no safe way to “put the key on the published site.” If you want generation to happen in a browser UI, you still need a server or Actions job that holds the secret.

## 3. Generate a new game from GitHub

1. Confirm `DEEPSEEK_API_KEY` exists.
2. **Actions → Generate Game → Run workflow**.
3. Type a game idea. Optionally enable the extra review pass.
4. The job writes a new `index.html`, commits it to `main`, and Pages deploys it.

## 4. Generate a new game on your machine

```bash
cp .env.example .env
# edit .env and paste the key
set -a && source .env && set +a
node scripts/generate.mjs "low-poly tank battle, 3 waves, WASD plus mouse aim"
npx serve .
```

Do not commit `.env`.

## Pipeline (what the generator does)

1. **Plan** — DeepSeek writes a short architecture plan from `prompts/architect.md`.
2. **Codegen** — DeepSeek writes one `index.html` from `prompts/codegen.md`.
3. **Optional pass** — `--extra-pass` or the workflow checkbox sends the file through `prompts/fix.md`.
4. **Package** — overwrite `index.html`. Ready for Pages.

A full headless WebGL test harness is not run in Actions (GitHub-hosted runners have no reliable GPU/WebGL). Open the file locally to playtest. If a run fails, paste the console stack into a new generate prompt or add it under `prompts/fix.md` and rerun with `--extra-pass`.

## Stack baked into every game

- Babylon.js core from `https://cdn.babylonjs.com/babylon.js`
- Optional GUI / Cannon from the same CDN
- Procedural meshes and materials
- Web Audio oscillators if the game needs sound
- CSS HUD overlay

## Rotate a leaked key

If the key ever landed in a commit or in the published HTML:

1. Revoke it on the DeepSeek dashboard.
2. Create a new key.
3. Update the Actions secret and your local `.env`.
4. If it was committed, treat the old key as burned even after `git rm`.
