/**
 * @fileoverview Registers the Tailwind CSS PostCSS plugin.
 *
 * Processes application styles through the Tailwind build pipeline.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

const config = {
  plugins: {
    '@tailwindcss/postcss': {
      sources: {
        negated: false,
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default config;

// ---------------------------------------------------------------------------
