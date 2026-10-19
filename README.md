# Neural Flow

Based on the easy to use [Eleventy Excellent starter template](https://github.com/madrilene/eleventy-excellent).

[![gh-pages][gh-pages-shield]][gh-pages-url]

[gh-pages-shield]: https://github.com/PlagueHO/plagueho.github.io/actions/workflows/gh-pages.yml/badge.svg
[gh-pages-url]: https://github.com/PlagueHO/plagueho.github.io/actions/workflows/gh-pages.yml

## Dependency maintenance

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
