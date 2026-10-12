/**
 * @fileoverview Creates the shared MSW server for unit and component tests.
 *
 * Provides a place to register backend request fixtures as contracts become available.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { setupServer } from 'msw/node';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

// Only tests register handlers; there are no invented production endpoints.
const server = setupServer();

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default server;

// ---------------------------------------------------------------------------
