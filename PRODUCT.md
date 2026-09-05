# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers, cloud architects, and technical community members evaluating practical guidance on AI, agents, Azure, GitHub workflows, and related projects. They arrive to discover relevant posts and projects, assess the author's expertise, and read technical material in depth.

## Product Purpose

Neural Flow is Daniel Scott-Raynsford's personal technical site and blog. It shares practical engineering experience, ideas, and projects related to agentic AI, cloud software development, and intelligent systems.

## Positioning

The site connects hands-on Azure and AI engineering material with Daniel's lived experience as a Microsoft Partner Solution Architect, open-source maintainer, community organizer, and long-time software engineer.

## Operating Context

Visitors browse recent posts, archived articles, projects, communities, and biographical material on a static website. The primary routes are the homepage, blog/archive listings, individual technical posts, and project detail pages.

## Capabilities and Constraints

- Eleventy 3 generates the site with Nunjucks templates, WebC components, Markdown content, PostCSS/Tailwind, and esbuild.
- The site is deployed to GitHub Pages from `main`.
- Existing site metadata and navigation live under `src/_data`; shared layout and component templates live under `src/_layouts` and `src/_includes`.
- New UI assets must use existing `src/assets` pipelines, and `isArchived` retains its collection behavior.

## Brand Commitments

- The site name is Neural Flow.
- Voice is first-person, opinionated, pragmatic, and technically grounded.
- Preserve the existing identity and factual content; this work is refinement, not a rebrand or content rewrite.

## Evidence on Hand

- Published posts in `src/posts/` and projects in `src/projects/`.
- Author background and community information in `src/pages/about.njk` and `src/pages/communities.njk`.
- Existing logos, SVGs, photography, generated color tokens, and theme-aware styling under `src/assets/`.

## Product Principles

- Make practical engineering knowledge straightforward to discover and consume.
- Demonstrate expertise through real articles, projects, and community work rather than manufactured proof.
- Keep technical reading accessible across screen sizes and color themes.
- Favor durable, static-web simplicity and maintainable modular implementation.

## Accessibility & Inclusion

Maintain semantic, keyboard-accessible interactions, visible focus states, theme-aware contrast, motion preferences, and comfortable long-form reading across desktop and mobile web.
