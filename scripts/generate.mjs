#!/usr/bin/env node
/**
 * Static Browser Game Generator
 * Calls DeepSeek to produce a single-file Babylon.js game.
 * API key is read from DEEPSEEK_API_KEY — never commit that value.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const API_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const API_KEY = process.env.DEEPSEEK_API_KEY;

if (!API_KEY) {
  console.error("Missing DEEPSEEK_API_KEY. Set it in a local .env (not committed) or as a GitHub Actions secret.");
  process.exit(1);
}

const idea = process.argv.slice(2).join(" ").trim() || process.env.GAME_IDEA ||
  "A neon hover-craft arena. Collect 10 glowing orbs before the timer hits zero. Avoid red sentry spheres.";
const extraPass = process.env.EXTRA_PASS === "1" || process.argv.includes("--extra-pass");

function readPrompt(name) {
  return fs.readFileSync(path.join(root, "prompts", name), "utf8");
}

function stripFences(text) {
  let out = text.trim();
  if (out.startsWith("```")) {
    out = out.replace(/^```(?:html)?\s*/i, "");
    out = out.replace(/\s*```$/, "");
  }
  const start = out.indexOf("<!DOCTYPE html>");
  const start2 = out.toLowerCase().indexOf("<html");
  if (start >= 0) out = out.slice(start);
  else if (start2 >= 0) out = out.slice(start2);
  return out.trim();
}

async function chat(messages, maxTokens) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: maxTokens,
      stream: false
    })
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepSeek HTTP ${res.status}: ${body.slice(0, 500)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned an empty message.");
  return content;
}

async function main() {
  console.log("Phase 1: planning");
  const plan = await chat([
    { role: "system", content: readPrompt("architect.md") },
    { role: "user", content: `Game idea:\n${idea}` }
  ], 2000);
  fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
  fs.writeFileSync(path.join(root, "artifacts", "plan.md"), plan);

  console.log("Phase 2: full code generation");
  let html = stripFences(await chat([
    { role: "system", content: readPrompt("codegen.md") },
    { role: "user", content: `Architecture plan:\n${plan}\n\nGame idea:\n${idea}` }
  ], 8192));

  if (!html.toLowerCase().includes("<html")) {
    throw new Error("Generator did not return an HTML document.");
  }

  if (extraPass) {
    console.log("Optional pass: review and tighten the single file");
    html = stripFences(await chat([
      { role: "system", content: readPrompt("fix.md") },
      { role: "user", content: "Run 1 additional deep error check and optimization pass. Keep the same game. Fix syntax issues, missing engine init, and file:// breakage.\n\nCurrent file:\n" + html }
    ], 8192));
  }

  const out = path.join(root, "index.html");
  fs.writeFileSync(out, html.endsWith("\n") ? html : html + "\n");
  console.log("Wrote", out);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
