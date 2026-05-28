# Neural Flow — Copilot Instructions

<!-- Project-specific authoring guide for GitHub Copilot. See AGENTS.md for layout, commands, and CI. -->

## Purpose

Personal site and technical blog at https://danielscottraynsford.com, focused on AI, agents, and Azure.
Built with Eleventy 3, Nunjucks templates, WebC components, Markdown content, PostCSS/Tailwind 4, and
esbuild. Deployed to GitHub Pages from the `main` branch.

## Critical Rules

- **Preserve modular architecture** — extend `src/_config` modules before adding any top-level build logic.
- **Preserve `isArchived` semantics** — collections depend on it; do not repurpose or remove the flag.
- **Route assets through pipelines** — new CSS under `src/assets/css/`, new JS under `src/assets/scripts/`.
- **Prefer `src/_data`** — update `meta.js`, `personal.yaml`, or `navigation.js` instead of hardcoding values in templates.
- **No secrets** — never commit credentials, tokens, or private endpoints; use environment variables.

## Code Style

- 2-space indentation for JS, JSON, YAML, and Nunjucks.
- Single quotes in JavaScript; template literals only when interpolating.
- Compact object spacing — match the style already present in neighbouring files.
- Keep functions small and co-located with their domain module in `src/_config`.

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| JS config/util files | kebab-case | `build-tokens-css.js` |
| Data modules | lowercase descriptive | `meta.js`, `navigation.js` |
| Post files | `YYYY-MM-DD-slug.md` | `2025-05-26-deploying-foundryvtt-to-azure.md` |
| Project folders | kebab-case slug | `genai-database-explorer` |
| Exported JS helpers | camelCase | `getAllPosts`, `showInSitemap` |

## Eleventy Patterns

- Wire new filters, shortcodes, plugins, and collections through their matching `src/_config` index modules;
  `eleventy.config.js` only calls `addPlugin`, `addFilter`, `addCollection`, etc.
- Check `src/_config/filters/`, `src/_config/shortcodes/`, and `src/_config/utils/` before creating helpers —
  `imageShortcode`, `markdownFormat`, and `slugifyString` already exist.
- Collections are defined in `src/_config/collections.js`; inline collection logic in `eleventy.config.js` is
  intentional only for `livePosts` and `archivedPosts`.

```js
// Avoid — inline logic when a module category exists
eleventyConfig.addFilter('myThing', (val) => val.toUpperCase());

// Prefer — implement in src/_config/filters/my-thing.js, export from filters.js, wire in eleventy.config.js
eleventyConfig.addFilter('myThing', filters.myThing);
```

## Content Authoring

- Frontmatter must include `title`, `date` (posts), and `tags` (include `posts` to join the feed).
  Use `isArchived: true` to retire a post — do not remove the `posts` tag.
- Reference images as `/assets/images/…` so Eleventy Image optimises them automatically.
- Voice: first person, opinionated, pragmatic. Structure with Background / Why / How / Conclusion headings.
- Paragraphs: 2–4 sentences. Use `> [!NOTE]` / `> [!IMPORTANT]` callouts for risks and prerequisites.
- Numbered lists for sequential CLI or provisioning steps; fenced code blocks with language hints always.

## Security

- No hardcoded credentials, tokens, or internal URLs anywhere in source.
- Do not introduce unescaped HTML rendering paths; use existing sanitisation helpers.
- External inputs must be validated before use in templates or build scripts.