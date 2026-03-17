import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {clampGenerator} from '../utils/clamp-generator.js';
import {tokensToTailwind} from '../utils/tokens-to-tailwind.js';

const require = createRequire(import.meta.url);

// Raw design tokens
const colorTokens = require('../../_data/designTokens/colors.json');
const borderRadiusTokens = require('../../_data/designTokens/borderRadius.json');
const fontTokens = require('../../_data/designTokens/fonts.json');
const spacingTokens = require('../../_data/designTokens/spacing.json');
const textSizeTokens = require('../../_data/designTokens/textSizes.json');
const textLeadingTokens = require('../../_data/designTokens/textLeading.json');
const textWeightTokens = require('../../_data/designTokens/textWeights.json');

const colors = tokensToTailwind(colorTokens.items);
const borderRadius = tokensToTailwind(borderRadiusTokens.items);
const fontFamily = tokensToTailwind(fontTokens.items);
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items));
const fontWeight = tokensToTailwind(textWeightTokens.items);
const lineHeight = tokensToTailwind(textLeadingTokens.items);
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items));

export const buildTokensCss = async () => {
  // Generate :root custom properties
  const groups = [
    {tokens: colors, prefix: 'color'},
    {tokens: borderRadius, prefix: 'border-radius'},
    {tokens: spacing, prefix: 'space'},
    {tokens: fontSize, prefix: 'size'},
    {tokens: lineHeight, prefix: 'leading'},
    {tokens: fontFamily, prefix: 'font'},
    {tokens: fontWeight, prefix: 'font'}
  ];

  let rootProps = '';
  groups.forEach(({tokens, prefix}) => {
    Object.entries(tokens).forEach(([key, value]) => {
      rootProps += `  --${prefix}-${key}: ${value};\n`;
    });
  });

  // Generate custom utility classes
  const customUtilities = [
    {tokens: spacing, prefix: 'flow-space', property: '--flow-space'},
    {tokens: spacing, prefix: 'region-space', property: '--region-space'},
    {tokens: spacing, prefix: 'gutter', property: '--gutter'}
  ];

  let utilityClasses = '';
  customUtilities.forEach(({tokens, prefix, property}) => {
    Object.entries(tokens).forEach(([key, value]) => {
      utilityClasses += `.${prefix}-${key} {\n  ${property}: ${value};\n}\n`;
    });
  });

  const css = `/* Auto-generated from design tokens — do not edit manually */
:root {
${rootProps}}

${utilityClasses}`;

  const outputPath = 'src/assets/css/global/base/generated-tokens.css';
  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, css);
};
