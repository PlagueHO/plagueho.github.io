This repository contains the source for the blog at https://danielscottraynsford.com. The site is built with Eleventy (11ty) and hosted on GitHub Pages. Posts live under `src/posts/` and images under `src/assets/images/`.

Purpose: guidance for AI coding agents working in this repo. Keep output concise, practical, and aligned with the author's voice.

Key repo facts (quick)
- Static site generator: Eleventy (11ty). Primary config: `eleventy.config.js` and `src/_config/`.
- Content: `src/posts/` (Markdown), `src/_layouts/` (Nunjucks), `src/_includes/`, `src/_data/`.
- Styling: Tailwind CSS (`tailwind.config.js` and `src/_includes/css/`).
- Deploy: GitHub Pages (primary). `netlify.toml` and `vercel.json` exist for alternate flows.

Developer workflows (concise)
- Local dev: run Eleventy server: `npx @11ty/eleventy --serve` (there's a VS Code task "Start Eleventy (npm)").
- Add content: create Markdown with YAML front matter in `src/posts/`, add images to `src/assets/images/`.
- Custom logic: filters/shortcodes/plugins in `src/_config/`.

Writing style — author-specific guidance (short bullets)
- Voice: first person (“I”) and address the reader as “you”. Use contractions; be conversational and direct.
- Tone: casual, enthusiastic, but opinionated — state recommendations plainly ("I prefer X because...").
- Brevity: short paragraphs (2–4 sentences). Prefer numbered steps and bullet lists for procedures.
- Structure: use clear headings like Background, Why, How, Conclusion. Start posts with a short Background, finish with a brief Conclusion or Related links.
- Examples: include concise, runnable code snippets with short comments (see `src/posts/2025/05/2025-05-17-using-defaultazurecredential-with-semantic-kernel-in-python.md`).
- Callouts: preserve repo-style admonitions (e.g., `> [!NOTE]`, `> [!IMPORTANT]`) for warnings and important params (see `2025-05-26-deploying-foundryvtt-to-azure-in-5-minutes.md`).
- Opinion + rationale: when recommending tools or settings, add a one-line reason.
- Personal touch: small first-person notes or motivations are fine, keep them tightly focused.

Content & formatting rules (repo specifics)
- Always include YAML front matter: `title`, `date`, `tags` (example front matter shown below).
- Use fenced code blocks with language tags and brief inline comments for clarity.
- Use numbered lists for step-by-step CLI or provisioning instructions.
- Reference assets with repo paths (e.g., `/assets/banners/...` or `src/assets/images/`).

Minimal example front matter:

---
title: "My Short How-to"
date: 2025-08-17
tags: [azure, tutorial]
---

Practical tip for agents
- When making content changes, scan `src/_config/` for filters/shortcodes that affect output (e.g., `src/_config/shortcodes/image.js`) and preserve expected parameters.
- If uncertain about deployment, state the verified facts (Eleventy + GitHub Pages + optional Netlify/Vercel configs) and ask one precise question.

Files to reference for patterns
- `src/posts/2025/05/2025-05-26-deploying-foundryvtt-to-azure-in-5-minutes.md` — procedural style, numbered steps, callouts.
- `src/posts/2025/05/2025-05-17-using-defaultazurecredential-with-semantic-kernel-in-python.md` — concise code-first example with short background and conclusion.

Keep the guidance short and token-efficient: focus on explicit examples, file paths, and direct commands. Ask one clarifying question if a required detail is missing.

End of AI agent guidance.