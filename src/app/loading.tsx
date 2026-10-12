/**
 * @fileoverview Displays loading feedback while a route is rendering.
 *
 * Gives users an accessible indication that navigation is in progress.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import Feedback from '@/components/shared/feedback';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const Loading = () => {
  return (
    <Feedback
      title="Loading workspace"
      description="Getting your workspace ready…"
    />
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default Loading;

// ---------------------------------------------------------------------------
