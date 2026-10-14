'use client';

import * as Alert from '@/components/ui/alert';
import { RiInformationLine } from '@remixicon/react';

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

export default DemoNotice;
