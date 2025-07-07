# TailwindCSS v3 Baseline Performance Results

**Date**: 2025-07-07  
**TailwindCSS Version**: 3.4.17  
**Node.js Version**: 20+  
**Test Environment**: Windows PowerShell  

## Build Performance Baseline

### Test Methodology
- **Command**: `npm run build` (includes `npm run clean`)
- **Test Runs**: 3 consecutive tests
- **Clean State**: Build directory cleaned before each test
- **Measurement Tool**: PowerShell `Measure-Command`

### Results

| Test | Total Time (seconds) | Total Time (ms) |
|------|---------------------|-----------------|
| 1    | 41.08               | 41,076          |
| 2    | 38.75               | 38,747          |
| 3    | 39.61               | 39,613          |

### Statistics
- **Average**: 39.81 seconds (39,812 ms)
- **Minimum**: 38.75 seconds 
- **Maximum**: 41.08 seconds
- **Range**: 2.33 seconds
- **Standard Deviation**: ±1.19 seconds

### Build Output Analysis

#### TailwindCSS Warnings
```
warn - You have enabled experimental features: optimizeUniversalDefaults
warn - Experimental features in Tailwind CSS are not covered by semver, may introduce 
 breaking changes, and can change at any time.
```

### Performance Expectations for v4

According to TailwindCSS v4 documentation, the upgrade should deliver:
- **Target Improvement**: 3.5x faster build times
- **Expected v4 Time**: ~11.37 seconds (39.81 ÷ 3.5)
- **Expected Improvement**: ~28.44 seconds reduction

### Build Process Components

1. **Clean Phase**: `rimraf dist src/_includes/css src/_includes/scripts`
2. **Eleventy Build**: `cross-env ELEVENTY_ENV=production eleventy`
3. **CSS Processing**: PostCSS pipeline with TailwindCSS, autoprefixer, cssnano
4. **Custom Plugin Execution**: CSS custom property generation, utility class generation
5. **Design Token Processing**: JSON to CSS conversion via utility functions

### System Information
- **Build Command**: `npm run build`
- **Environment**: Production (`ELEVENTY_ENV=production`)
- **PostCSS Plugins**: postcss-import-ext-glob, postcss-import, tailwindcss, autoprefixer, cssnano
- **Custom Plugins**: 2 active (CSS properties generator, utility classes generator)

### Key Performance Factors
1. **Design Token Processing**: Multiple JSON files converted to CSS
2. **Custom Plugin Execution**: Significant JavaScript processing for CSS generation  
3. **PostCSS Pipeline**: Multiple processing steps
4. **File I/O**: Template processing, CSS compilation, output generation
5. **TailwindCSS Processing**: Current experimental optimizations enabled

### Benchmark for v4 Comparison
- **Baseline Time**: 39.81 seconds average
- **Success Criteria**: Build time under 15 seconds (2.5x improvement minimum)
- **Target Time**: 11.37 seconds (3.5x improvement)
- **Critical Threshold**: No regression beyond 45 seconds
