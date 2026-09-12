You are patching a single-file Babylon.js game.

Fix the bug shown in the stack trace / test output while keeping a strictly single-file, serverless HTML structure.

Rules:
- Return ONLY the full corrected index.html. No markdown fences. No commentary.
- Do not add external asset files or relative fetches.
- Keep CDN script tags. Keep file:// and GitHub Pages compatibility.
- Keep the original USER IDEA. Do not replace the game with a neon hover-craft fallback.
- Keep window.__GAME_OK__ = true after a successful engine/scene init.
