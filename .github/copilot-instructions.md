# Purpose
- Eleventy site for https://danielscottraynsford.com. Content lives under `src/`, build output goes to `dist/` and is published via GitHub Pages (Netlify/Vercel configs exist but aren’t primary).

## Architecture Snapshot
- `eleventy.config.js` delegates nearly everything to modular helpers in `src/_config/`. Understand those modules before touching build logic.
- Collections: `src/_config/collections.js` defines `allPosts`, `allProjects`, sitemap sources, and filters out archived content. `eleventy.config.js` also creates `livePosts`/`archivedPosts` collections, so keep `data.isArchived` semantics intact.
- Data layer: `src/_data/meta.js`, `personal.yaml`, and `navigation.js` drive site-wide metadata and navigation. Update these instead of sprinkling constants.
- Layouts & includes: Nunjucks templates in `src/_layouts/` and `src/_includes/partials/`; WebC components live in `src/_includes/webc/` and are auto-registered via the WebC plugin.

## Build & Runtime
- Install deps with `npm install`. Key scripts: `npm run dev:11ty` (Eleventy dev server + watch), `npm run build` (cleans then production build), `npm run favicons|colors|screenshots` (asset generation).
- `ELEVENTY_ENV` toggles behavior; scripts set it via `cross-env`. For ad-hoc runs use `npx cross-env ELEVENTY_ENV=development eleventy --serve` or `ELEVENTY_ENV=production npx @11ty/eleventy`.
- Before Eleventy runs it calls `events.buildAllCss()` and `events.buildAllJs()`. These compile Tailwind/PostCSS and bundle JS via esbuild, writing results into `src/_includes` and `dist/assets`. If you add new CSS/JS entry points, place them under `src/assets/css/**` or `src/assets/scripts/**` so the event builders and template extensions pick them up.
- CSS processing is duplicated for watch mode via `src/_config/plugins/css-config.js`, which routes global CSS to `src/_includes/css/global.css`, local page CSS to matching filenames, and component CSS directly into `dist/assets/css/components/`.
- JS behaves similarly in `src/_config/plugins/js-config.js`: files in `bundle/` emit inline includes under `src/_includes/scripts/`, while `components/` bundle to `dist/assets/scripts/components/`.

## Content Workflow
- Posts sit in `src/posts/YYYY/MM/slug.md`; projects mirror this under `src/projects/`. Every markdown file needs YAML front matter with `title`, `date`, and `tags` (include `posts` to join the main feed). Use `isArchived: true` when moving posts out of the live list instead of deleting tags.
- Images belong in `src/assets/images/`; refer to them as `/assets/images/...` so Eleventy Image shortcodes and transforms can optimize them.
- Filters live in `src/_config/filters/`, shortcodes in `src/_config/shortcodes/`, and both are registered automatically. Check existing utilities (e.g., `imageShortcode`, `markdownFormat`) before inventing new helpers.

## Voice & Formatting
- Write in first person and speak directly to the reader. Keep paragraphs tight (2–4 sentences) and organized with headings like Background/Why/How/Conclusion.
- Be opinionated and pragmatic: call out trade-offs, tie advice to real workflows, and end with actionable next steps or links.
- Always provide runnable code blocks with language hints and quick inline comments where clarity matters. Prefer numbered lists for CLI or provisioning steps.
- Use callouts (`> [!NOTE]`, etc.) for risks, prerequisites, or gotchas. Reference best-practice frameworks (Well-Architected, SOLID, DevOps) only when they materially support the guidance.

## Reference Examples
- `src/posts/2025/05/2025-05-26-deploying-foundryvtt-to-azure-in-5-minutes.md` shows the expected procedural tutorial flow with callouts.
- `src/posts/2025/05/2025-05-17-using-defaultazurecredential-with-semantic-kernel-in-python.md` demonstrates concise code-first storytelling.

## Practical Tips
- If you touch asset pipelines, mirror the existing routing logic so both `events/*.js` and `plugins/*.js` stay in sync.
- Updating metadata? Prefer `_data` files over hard-coded strings in layouts.
- Unsure about deployment specifics? Reinforce known facts (Eleventy + GitHub Pages) and ask one focused question instead of guessing.
- Keep responses short and actionable; ask for missing context when required.