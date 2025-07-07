# TailwindCSS v3 Configuration Documentation

**Date Created**: 2025-07-07  
**Version**: TailwindCSS 3.4.17  
**Purpose**: Document current TailwindCSS v3 configuration before v4 migration

## Current Dependencies

```json
{
  "tailwindcss": "^3.4.17"
}
```

## Configuration Structure

### Primary Configuration File
- **File**: `tailwind.config.js`
- **Type**: JavaScript ES Module
- **Size**: ~4.5KB

### Key Configuration Elements

#### Content Sources
```javascript
content: ['./src/**/*.{html,js,md,njk,liquid,webc}']
```

#### Custom Screens/Breakpoints
```javascript
screens: {
  ltsm: {max: `${viewportTokens.sm}px`},
  sm: `${viewportTokens.sm}px`,
  md: `${viewportTokens.md}px`,
  ltnavigation: {max: `${viewportTokens.navigation}px`},
  navigation: `${viewportTokens.navigation}px`
}
```

#### Design Token Integration
- **Colors**: Sourced from `src/_data/designTokens/colors.json`
- **Border Radius**: Sourced from `src/_data/designTokens/borderRadius.json`
- **Font Family**: Sourced from `src/_data/designTokens/fonts.json`
- **Spacing**: Sourced from `src/_data/designTokens/spacing.json` (with clamp generation)
- **Text Sizes**: Sourced from `src/_data/designTokens/textSizes.json` (with clamp generation)
- **Text Leading**: Sourced from `src/_data/designTokens/textLeading.json`
- **Text Weights**: Sourced from `src/_data/designTokens/textWeights.json`
- **Viewports**: Sourced from `src/_data/designTokens/viewports.json`

#### Core Plugins Configuration
```javascript
corePlugins: {
  preflight: false,
  textOpacity: false,
  backgroundOpacity: false,
  borderOpacity: false
}
```

#### Blocklist
```javascript
blocklist: ['container']
```

#### Experimental Features
```javascript
experimental: {
  optimizeUniversalDefaults: true
}
```

#### Variant Order
Custom defined order for pseudo-class variants to ensure consistent CSS output.

### Custom Plugins

#### 1. CSS Custom Properties Generator
- **Purpose**: Generates CSS custom properties from Tailwind config
- **Output**: Root-level CSS variables for colors, border-radius, spacing, etc.
- **Prefixes**: 
  - `--color-*` for colors
  - `--border-radius-*` for border radius
  - `--space-*` for spacing
  - `--size-*` for font sizes
  - `--leading-*` for line heights
  - `--font-*` for font families and weights

#### 2. Custom Utility Classes Generator
- **Purpose**: Creates utility classes for flow-space, region-space, and gutter
- **Classes Generated**:
  - `.flow-space-*` → `--flow-space: [value]`
  - `.region-space-*` → `--region-space: [value]`
  - `.gutter-*` → `--gutter: [value]`

### CSS Import Structure

**File**: `src/assets/css/global/global.css`

```css
@import 'tailwindcss/base' layer(tailwindBase);
@import 'base/reset.css' layer(reset);
@import 'base/fonts.css' layer(fonts);
@import 'tailwindcss/components' layer(tailwindComponents);
@import 'base/variables.css' layer(variables);
@import 'base/global-styles.css' layer(global);
@import-glob 'compositions/*.css' layer(compositions);
@import-glob 'blocks/*.css' layer(blocks);
@import-glob 'utilities/*.css' layer(utilities);
@import 'tailwindcss/utilities' layer(tailwindUtilities);
```

### PostCSS Pipeline

**File**: `src/_config/plugins/css-config.js`

```javascript
postcss([
  postcssImportExtGlob,
  postcssImport,
  tailwindcss,
  autoprefixer,
  cssnano
])
```

### Utility Functions

#### 1. Clamp Generator
- **File**: `src/_config/utils/clamp-generator.js`
- **Purpose**: Generates responsive clamp() values for spacing and text sizes
- **Input**: Design token objects with min/max values
- **Output**: CSS clamp() functions

#### 2. Tokens to Tailwind Converter
- **File**: `src/_config/utils/tokens-to-tailwind.js`
- **Purpose**: Converts design token JSON structure to Tailwind-compatible objects
- **Input**: Design token arrays with name/value pairs
- **Output**: Tailwind theme objects

## Migration Considerations

### High-Impact Areas
1. **Custom Plugin System**: Both plugins heavily use PostCSS-JS for CSS generation
2. **Layer System**: Complex CSS layer ordering may need adjustment
3. **Design Token Processing**: Utilities depend on specific JSON structure
4. **Custom Properties**: Extensive use of CSS custom properties throughout

### Dependencies to Monitor
- `postcss-js`: Used for CSS object generation in plugins
- `postcss`: Core dependency for CSS processing
- Design token JSON files: Must remain compatible with utility functions

### Performance Baseline
- **Build Command**: `npm run build`
- **Dev Command**: `npm run start`
- Current build performance to be measured in TASK-005

## Related Files

- `tailwind.config.js` - Main configuration
- `src/assets/css/global/global.css` - CSS imports and layers
- `src/_config/plugins/css-config.js` - PostCSS pipeline
- `src/_config/utils/clamp-generator.js` - Responsive sizing utility
- `src/_config/utils/tokens-to-tailwind.js` - Token conversion utility
- `src/_data/designTokens/*.json` - Design token source files
