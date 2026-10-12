/**
 * @fileoverview Redirects the home route to the dashboard.
 *
 * Provides the default entry point into the finance application.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Home = () => {
  redirect('/dashboard');
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Home;

// ---------------------------------------------------------------------------
