---
name: Neural Flow
description: Personal technical site and blog for practical AI, agents, and Azure engineering.
colors:
  primary: "#9b5ed4"
  primary-dark: "#a76bc2"
  secondary: "#009688"
  secondary-dark: "#26a69a"
  tertiary: "#fbbe25"
  tertiary-dark: "#f1c15b"
  surface-light: "#f8f8f8"
  surface-dark: "#2e2e2e"
  text-light: "#f8f8f8"
  text-dark: "#161616"
  border-light: "#e4e4e4"
  border-dark: "#484848"
  on-accent: "#000000"
  rainbow-coral: "#cf4662"
  rainbow-green: "#62c95c"
  rainbow-aqua: "#08bccb"
  rainbow-mauve: "#a977d5"
typography:
  display:
    fontFamily: "Redhat, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.6875rem, 1.36rem + 1.63vw, 2.75rem)"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.075ch"
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.88rem + 0.58vw, 1.375rem)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-0.04ch"
rounded:
  small: "0.1875rem"
  medium: "0.3rem"
spacing:
  xs: "clamp(0.3125rem, 0.27rem + 0.19vw, 0.4375rem)"
  s: "clamp(0.625rem, 0.55rem + 0.38vw, 0.875rem)"
  m: "clamp(0.875rem, 0.74rem + 0.67vw, 1.3125rem)"
  l: "clamp(1.1875rem, 1.01rem + 0.87vw, 1.75rem)"
  xl: "clamp(2.375rem, 2.03rem + 1.73vw, 3.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.small}"
    padding: "{spacing.xs} {spacing.m}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-light}"
    rounded: "{rounded.small}"
    padding: "{spacing.xs} {spacing.m}"
  card:
    backgroundColor: "{colors.border-light}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.medium}"
    padding: "{spacing.s} {spacing.m}"
---

# Design System: Neural Flow

## Overview

**Creative North Star: "The practical signal path."**

Neural Flow is an editorial technical system that makes dense engineering knowledge approachable rather than ornamental. Its expressive purple, teal, and gold accents introduce AI-minded energy while restrained neutral surfaces keep the focus on discovery and long-form reading.

The visual system is compact, semantic, and responsive. CUBE-inspired compositions provide page rhythm; a small number of expressive features—gradient headings, spot-color section banners, and the custom card—identify the site without competing with the writing.

**Key Characteristics:**

- Fluid, accessible typography and spacing from generated custom-property scales.
- Theme-aware neutral surfaces with purple, teal, and gold semantic accents.
- Dense but breathable editorial content, constrained to readable measures.
- Flat, bordered components that communicate hierarchy without decorative elevation.

## Colors

The palette pairs calm grayscale reading surfaces with three high-signal accents that retain their roles in light and dark themes.

### Primary

- **Signal Purple** (`#9b5ed4`; dark-theme `#a76bc2`): primary actions, selected navigation, headings, and card interaction state.

### Secondary

- **Flow Teal** (`#009688`; dark-theme `#26a69a`): secondary actions and the second stop in expressive gradients.

### Tertiary

- **Insight Gold** (`#fbbe25`; dark-theme `#f1c15b`): tertiary actions, highlighting, and the final gradient stop.

### Neutral

- **Paper Light** (`#f8f8f8`): light-theme page background and inverse text.
- **Graphite** (`#2e2e2e`): dark-theme page background.
- **Ink** (`#161616`): strong dark text and inverse controls.
- **Soft Border** (`#e4e4e4` light; `#484848` dark): cards and structural strokes.
- **On Accent** (`#000000`): control foreground on the primary, secondary, and tertiary accent surfaces to maintain readable contrast.
- **Rainbow accents** (`#cf4662`, `#62c95c`, `#08bccb`, `#a977d5`): decorative stops used only by the existing rainbow gradient.

**The Accent Role Rule.** Use primary, secondary, and tertiary colors for semantic roles and deliberate focal moments; use the neutral system for ordinary reading surfaces and copy.

## Typography

**Display Font:** Redhat, with Segoe UI, Roboto, Helvetica Neue, Arial, and sans-serif fallbacks.

**Body Font:** Atkinson Hyperlegible, with the system UI fallback stack.

**Character:** Extra-bold, tightly tracked display headings create technical confidence; the body stack and 60–80ch reading measures keep long posts comfortable.

### Hierarchy

- **Display:** 900 weight, fluid `--size-step-2` through `--size-step-6`, 1.2 line-height; page and content titles.
- **Headline:** 900 weight, fluid `--size-step-1` through `--size-step-3`, 1.2 line-height; section and card headings.
- **Body:** 400 weight, fluid `--size-step-min-1`, 1.4 line-height; prose and primary navigation content.
- **Label:** fluid `--size-step-min-2`, wide tracking when uppercase; status labels and compact metadata.

## Layout

The wrapper is fluid up to 85rem. Editorial prose defaults to 64rem and individual text units to 60ch; post prose expands to 80rem while preserving an 80ch text measure. The fluid spacing scale drives stack, region, and gutter utilities from extra-small through 3xl.

The header places the site logo and navigation in a repel composition. Navigation becomes a fixed, off-canvas drawer below 662px and a horizontal row above that breakpoint. Homepage content introduces a spot-color title section, a featured card, and a two-column masonry treatment for recent posts.

## Elevation & Depth

The system is flat by default. Bordered surfaces, tonal background changes, and generous region spacing communicate grouping; the mobile navigation drawer adds a restrained edge shadow only while it overlays the page.

**The Flat-By-Default Rule.** Do not add ambient shadows to ordinary content cards. Interaction feedback should come from the primary border, color, underline, or focus outline.

## Shapes

Geometry is compact and lightly rounded: 0.1875rem for controls and 0.3rem for cards and navigation items. Images inside prose use the medium radius and structural stroke. Section dividers and color gradients provide the system's more expressive contours.

## Components

### Buttons

- **Shape:** compact rounded rectangle using the small radius.
- **Primary:** Signal Purple with inverse light text.
- **Secondary:** Flow Teal with inverse light text.
- **Tertiary:** Insight Gold with dark text.
- **Hover / Focus:** colors deepen through `color-mix`; focus retains the shared visible outline.

### Cards / Containers

- **Corner Style:** medium radius with a 4px structural border.
- **Background:** accent surface with theme-aware text.
- **Interaction:** clickable cards shift their border to Signal Purple on hover and focus-within.
- **Content:** grid slots hold a heading, metadata, description, and optional feature icons.

### Navigation

- **Style:** bold uppercase display labels; underline and primary color mark the desktop active state.
- **Mobile treatment:** accessible menu button controls an off-canvas drawer with a reduced-motion-safe state change.

### Prose

- **Measure:** default paragraphs target 60ch; post paragraphs allow up to 80ch.
- **Structure:** fluid vertical rhythm, clear display headings, colored list markers, bordered media, and primary-accent callouts.

## Do's and Don'ts

- **Do** use existing semantic color variables so light and dark themes stay coherent.
- **Do** use wrapper, flow, region, and gutter compositions instead of page-specific spacing hacks.
- **Do** preserve prose reading measures and responsive type steps for technical content.
- **Do** retain semantic HTML, visible focus treatment, and reduced-motion behavior in shared controls.
- **Don't** introduce new colors, shadows, or radii without extending the generated token system.
- **Don't** use gradient treatments as a substitute for semantic hierarchy or readable contrast.
- **Don't** bypass shared layouts, components, or asset pipelines for isolated page styling.
