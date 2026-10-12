/**
 * @fileoverview Displays the sample-data notice.
 *
 * Makes clear that dashboard examples are not live financial records.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import * as Alert from '@/components/ui/alert';

import { RiInformationLine } from '@remixicon/react';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const DemoNotice = () => {
  return (
    <Alert.Root variant="lighter" status="information" size="small">
      <Alert.Icon as={RiInformationLine} />
      <span>
        Sample workspace · All amounts and transactions are mock data.
      </span>
    </Alert.Root>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default DemoNotice;

// ---------------------------------------------------------------------------
