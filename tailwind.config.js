/* TailwindCSS v4 Configuration */
/* Most configuration has been moved to CSS @theme block in global.css */

export default {
  content: ['./src/**/*.{html,js,md,njk,liquid,webc}'],
  
  // v4 core plugins configuration
  corePlugins: {
    preflight: false,  // Keep disabled as in v3
  },

  // Prevents Tailwind's core components
  blocklist: ['container'],
};
