# Neural Flow

Based on the easy to use [Eleventy Excellent starter template](https://github.com/madrilene/eleventy-excellent).

[![gh-pages][gh-pages-shield]][gh-pages-url]

[gh-pages-shield]: https://github.com/PlagueHO/plagueho.github.io/actions/workflows/gh-pages.yml/badge.svg
[gh-pages-url]: https://github.com/PlagueHO/plagueho.github.io/actions/workflows/gh-pages.yml

## Runtime requirements

Use Node 26 LTS, version `26.13.1` or later, with its bundled npm tool.
GitHub Pages CI, the development container, and Netlify use Node 26.
The development container installs the locked dependencies with `npm ci`.
Rebuild an existing development container to use the updated runtime.
The npm install-script policy approves only `esbuild@0.28.2` for native binary
setup. Review its install script before updating that approval.

## Site link maintenance

Tag badges link only to generated tag pages. Tags used only by archived posts
remain visible as text, without changing the archive collections.
Original screenshots under `src/assets/images/screenshots/` are copied to the
same public asset path so image-enlargement links work. Inline images still
use Eleventy Image optimization.

Run `node --test test/tag-badge.test.js` for the focused tag rendering checks.
Run `npm run build` to check the complete site.

## Dependency maintenance

Use the npm tool supplied by your Node environment. The site does not need
`npm` or `install` as project dependencies.

The `package.json` override limits WebC's `nanoid` dependency to the patched
version `5.1.16`. WebC `0.11.4` still requests nanoid 4, which has unresolved
[security advisories](https://github.com/advisories/GHSA-28wg-ghj8-5hjv).
Keep the override until a stable WebC release requests a patched nanoid version.
Before removing it, run `npm ci`, `npm audit`, and `npm run build`, and check
WebC component identifier generation. The override does not change PostCSS's
separate nanoid 3 dependency.

Dependabot follows `dependabot-monthly-v1`: routine version updates are checked
on the first day of each month at 09:00 `Pacific/Auckland` time, using native
monthly scheduling so daylight saving is handled by the timezone. Minor and
patch updates are grouped per ecosystem and directory as
`github-actions-minor-and-patch`, `devcontainers-minor-and-patch`, or
`npm-minor-and-patch`; routine major updates remain individual pull requests.

For supported ecosystems (`github-actions` and `npm`), security updates are
grouped separately as `github-actions-security` or `npm-security`. These
updates remain event-driven and are not delayed by the monthly schedule or
release-age cooldown; security fixes that require a major bump can still join
the security group. The canonical `devcontainers-security` group remains
configured for policy consistency, but GitHub does not support Dependabot
security updates for Dev Containers, so it does not enable automatic fixes.

To check routine updates outside the normal window, go to **Insights** >
**Dependency graph** > **Dependabot**, then use **Recent update jobs** >
**Check for updates** for the relevant manifest. A manual check can create
activity outside the monthly window.
