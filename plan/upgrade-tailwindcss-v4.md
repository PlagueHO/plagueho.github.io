---
goal: Upgrade TailwindCSS from v3.4.17 to v4.1.11 for Enhanced Performance and Modern CSS Features
version: 1.0
date_created: 2025-07-07
last_updated: 2025-07-07
owner: PlagueHO
tags: ["upgrade", "tailwindcss", "performance", "css", "eleventy", "migration"]
---

# Introduction

This implementation plan executes the systematic upgrade of TailwindCSS from version 3.4.17 to version 4.1.11 for the AI/Azure-focused blog at danielscottraynsford.com. The upgrade will deliver 3.5x faster build times, modern CSS features (container queries, 3D transforms, color-mix()), and a CSS-first configuration approach while maintaining visual consistency across the Eleventy-powered blog.

## 1. Requirements & Constraints

- **REQ-001**: Maintain visual consistency across all blog pages and components
- **REQ-002**: Preserve Eleventy build pipeline functionality with zero breaking changes
- **REQ-003**: Achieve measurable performance improvements in build times (target: 3.5x faster)
- **REQ-004**: Enable access to TailwindCSS v4 modern CSS features (container queries, 3D transforms, color-mix())
- **REQ-005**: Convert JavaScript-based configuration (tailwind.config.js) to CSS-first approach
- **REQ-006**: Maintain compatibility with existing design token system and custom utilities
- **SEC-001**: Ensure no security vulnerabilities introduced through dependency updates
- **CON-001**: Migration must be completed without site downtime during deployment
- **CON-002**: Limited automated visual regression testing capabilities
- **CON-003**: Extensive blog content (multiple years of posts) requires comprehensive testing
- **CON-004**: Complex custom TailwindCSS configuration with design tokens and custom plugins
- **GUD-001**: Follow TailwindCSS v4 migration best practices and official guidance
- **GUD-002**: Implement staged rollout approach for risk mitigation
- **PAT-001**: Use automated upgrade tools where possible, manual migration where necessary

## 2. Implementation Steps

### Implementation Phase 1: Preparation and Environment Setup

- GOAL-001: Establish migration foundation with backup, analysis, and environment preparation

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Create backup branch `tailwindcss-v3-backup` from current main branch | ✅ | 2025-07-07 |
| TASK-002 | Create feature branch `upgrade/tailwindcss-v4` for migration work | ✅ | 2025-07-07 |
| TASK-003 | Document current TailwindCSS configuration in `docs/tailwindcss-v3-config.md` | ✅ | 2025-07-07 |
| TASK-004 | Inventory all TailwindCSS classes used across templates in `docs/tailwindcss-class-inventory.md` | ✅ | 2025-07-07 |
| TASK-005 | Run baseline build performance tests and document results | ✅ | 2025-07-07 |
| TASK-006 | Verify current build process stability with `npm run build` and `npm run start` | ✅ | 2025-07-07 |

### Implementation Phase 2: Dependency Updates and Initial Configuration

- GOAL-002: Update dependencies and establish v4 foundation while maintaining build compatibility

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-007 | Update package.json: Remove `tailwindcss@^3.4.17` | | |
| TASK-008 | Install TailwindCSS v4: `npm install tailwindcss@latest @tailwindcss/postcss` | | |
| TASK-009 | Update src/_config/plugins/css-config.js to use @tailwindcss/postcss plugin | | |
| TASK-010 | Test build process after dependency updates to ensure no immediate breaks | | |
| TASK-011 | Create backup of src/assets/css/global/global.css as global-v3-backup.css | | |

### Implementation Phase 3: CSS Configuration Migration

- GOAL-003: Convert from @tailwind directives to @import structure and migrate theme configuration

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-012 | Update src/assets/css/global/global.css: Replace @import 'tailwindcss/base' with @import "tailwindcss" | | |
| TASK-013 | Remove @import 'tailwindcss/components' and @import 'tailwindcss/utilities' from global.css | | |
| TASK-014 | Create new CSS @theme block in global.css with design token conversions | | |
| TASK-015 | Convert color tokens from tailwind.config.js to CSS custom properties format | | |
| TASK-016 | Convert spacing tokens from tailwind.config.js to CSS custom properties format | | |
| TASK-017 | Convert typography tokens (fonts, sizes, weights) to CSS custom properties format | | |
| TASK-018 | Convert border radius and other design tokens to CSS custom properties format | | |

### Implementation Phase 4: Automated Migration and Plugin Updates

- GOAL-004: Execute automated upgrade tools and update plugin configurations

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-019 | Run TailwindCSS automated upgrade tool: `npx @tailwindcss/upgrade@latest` | | |
| TASK-020 | Review and verify all automated transformations for accuracy | | |
| TASK-021 | Update gradient classes: bg-gradient-to-r → bg-linear-to-r across all templates | | |
| TASK-022 | Update gradient classes: bg-gradient-to-b → bg-linear-to-b across all templates | | |
| TASK-023 | Update gradient classes: bg-gradient-to-br → bg-linear-to-br across all templates | | |
| TASK-024 | Remove obsolete plugins from package.json (if any container-query related plugins exist) | | |

### Implementation Phase 5: Custom Configuration and Plugin Migration

- GOAL-005: Migrate custom TailwindCSS plugins and utilities to v4 compatible format

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-025 | Analyze custom plugin in tailwind.config.js for CSS custom property generation | | |
| TASK-026 | Convert custom utility plugin (flow-space, region-space, gutter) to v4 format | | |
| TASK-027 | Update corePlugins configuration for v4 compatibility | | |
| TASK-028 | Verify variant order configuration works with v4 | | |
| TASK-029 | Test custom screen breakpoints (ltsm, sm, md, ltnavigation, navigation) | | |
| TASK-030 | Remove or update experimental.optimizeUniversalDefaults configuration | | |

### Implementation Phase 6: Build System Integration and Testing

- GOAL-006: Ensure Eleventy build system integration and comprehensive testing

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-031 | Test Eleventy build process: `npm run build` with v4 configuration | | |
| TASK-032 | Test Eleventy development server: `npm run start` with hot reloading | | |
| TASK-033 | Verify CSS processing pipeline in src/_config/plugins/css-config.js | | |
| TASK-034 | Run visual regression testing on homepage and key blog pages | | |
| TASK-035 | Test responsive breakpoints across all viewport sizes | | |
| TASK-036 | Verify code syntax highlighting and blog post formatting | | |
| TASK-037 | Test navigation components and interactive elements | | |
| TASK-038 | Benchmark build performance and compare with v3 baseline | | |

## 3. Alternatives

- **ALT-001**: Gradual migration approach (keeping both v3 and v4 configurations) - rejected due to complexity and maintenance overhead
- **ALT-002**: Manual migration without automated upgrade tool - rejected due to higher error risk and time investment
- **ALT-003**: Waiting for more stable v4 release - rejected due to significant performance benefits and current stability of v4.1.11
- **ALT-004**: Complete redesign with new CSS framework - rejected due to extensive existing codebase and proven TailwindCSS effectiveness

## 4. Dependencies

- **DEP-001**: TailwindCSS v4.1.11 package availability and stability
- **DEP-002**: @tailwindcss/postcss plugin compatibility with current PostCSS setup
- **DEP-003**: Eleventy v3.1.2 compatibility with TailwindCSS v4 build process
- **DEP-004**: Node.js v20+ runtime for v4 requirements
- **DEP-005**: Design token JSON files in src/_data/designTokens/ directory
- **DEP-006**: Custom utility functions in src/_config/utils/ directory

## 5. Files

- **FILE-001**: package.json - Update TailwindCSS dependency and add @tailwindcss/postcss
- **FILE-002**: tailwind.config.js - Migrate configuration to CSS or remove if fully CSS-based
- **FILE-003**: src/assets/css/global/global.css - Primary CSS configuration file for @import and @theme
- **FILE-004**: src/_config/plugins/css-config.js - PostCSS plugin configuration
- **FILE-005**: All template files in src/ - Update any gradient classes and verify utility usage
- **FILE-006**: src/_data/designTokens/*.json - Design token files for CSS custom property conversion
- **FILE-007**: src/_config/utils/tokens-to-tailwind.js - Utility for design token processing
- **FILE-008**: src/_config/utils/clamp-generator.js - Utility for responsive sizing
- **FILE-009**: docs/tailwindcss-v3-config.md - Documentation of v3 configuration (new file)
- **FILE-010**: docs/tailwindcss-class-inventory.md - Class usage inventory (new file)

## 6. Testing

- **TEST-001**: Build verification test - `npm run build` completes without errors
- **TEST-002**: Development server test - `npm run start` runs with hot reloading functional
- **TEST-003**: Visual regression test - Homepage renders identically to v3 baseline
- **TEST-004**: Blog post formatting test - Multiple blog posts maintain consistent styling
- **TEST-005**: Responsive breakpoint test - All screen sizes render correctly
- **TEST-006**: Navigation component test - All navigation elements function and style correctly
- **TEST-007**: Code syntax highlighting test - Code blocks maintain proper formatting
- **TEST-008**: Performance benchmark test - Build times show measurable improvement
- **TEST-009**: CSS bundle size test - Final CSS bundle size is maintained or reduced
- **TEST-010**: Cross-browser compatibility test - Chrome, Firefox, Safari, Edge rendering verification

## 7. Risks & Assumptions

- **RISK-001**: Custom plugin compatibility may require significant manual migration effort
- **RISK-002**: Design token conversion may introduce subtle color or spacing differences
- **RISK-003**: Complex PostCSS pipeline integration may require troubleshooting
- **RISK-004**: Gradient class updates may miss instances in dynamically generated content
- **RISK-005**: Performance improvements may not materialize due to unique build configuration
- **ASSUMPTION-001**: Current Eleventy v3.1.2 is compatible with TailwindCSS v4 without updates
- **ASSUMPTION-002**: All existing TailwindCSS utilities have v4 equivalents or suitable alternatives
- **ASSUMPTION-003**: Design token JSON structure will remain compatible with v4 configuration approach
- **ASSUMPTION-004**: PostCSS plugin order and configuration will work with @tailwindcss/postcss
- **ASSUMPTION-005**: No breaking changes in dependent packages (autoprefixer, cssnano) during migration

## 8. Related Specifications / Further Reading

- [TailwindCSS v4 Upgrade Specification](spec/spec-upgrade-tailwindcss-v4.md)
- [TailwindCSS v4 Official Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [TailwindCSS v4 Documentation](https://tailwindcss.com/docs)
- [Eleventy CSS Processing Documentation](https://www.11ty.dev/docs/assets/)
- [PostCSS Plugin Documentation](https://postcss.org/docs/)
