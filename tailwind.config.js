/* © Andy Bell - https://github.com/Set-Creative-Studio/cube-boilerplate */

import {clampGenerator} from './src/_config/utils/clamp-generator.js';
import {tokensToTailwind} from './src/_config/utils/tokens-to-tailwind.js';

// Raw design tokens
import colorTokens from './src/_data/designTokens/colors.json';
import borderRadiusTokens from './src/_data/designTokens/borderRadius.json';
import fontTokens from './src/_data/designTokens/fonts.json';
import spacingTokens from './src/_data/designTokens/spacing.json';
import textSizeTokens from './src/_data/designTokens/textSizes.json';
import textLeadingTokens from './src/_data/designTokens/textLeading.json';
import textWeightTokens from './src/_data/designTokens/textWeights.json';
import viewportTokens from './src/_data/designTokens/viewports.json';

// Process design tokens
const colors = tokensToTailwind(colorTokens.items);
const borderRadius = tokensToTailwind(borderRadiusTokens.items);
const fontFamily = tokensToTailwind(fontTokens.items);
const fontSize = tokensToTailwind(clampGenerator(textSizeTokens.items));
const fontWeight = tokensToTailwind(textWeightTokens.items);
const lineHeight = tokensToTailwind(textLeadingTokens.items);
const spacing = tokensToTailwind(clampGenerator(spacingTokens.items));

export default {
  content: ['./src/**/*.{html,js,md,njk,liquid,webc}'],
  theme: {
    screens: {
      ltsm: {max: `${viewportTokens.sm}px`},
      sm: `${viewportTokens.sm}px`,
      md: `${viewportTokens.md}px`,
      navigation: `${viewportTokens.navigation}px`
    },
    colors,
    borderRadius,
    spacing,
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    backgroundColor: ({theme}) => theme('colors'),
    textColor: ({theme}) => theme('colors'),
    margin: ({theme}) => ({
      auto: 'auto',
      ...theme('spacing')
    }),
    padding: ({theme}) => theme('spacing')
  },
  plugins: []
};
