'use client';

import * as Button from '@/components/ui/button';
import '@/styles/fonts.css';
import '@/styles/globals.css';

const GlobalError = ({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) => {
  return (
    <html lang="en">
      <body className="bg-bg-white-0 p-10 text-text-strong-950">
        <h1 className="mb-4 text-2xl font-semibold">
          We could not load Speckvue Finance
        </h1>
        <p className="mb-6">Please try again in a moment.</p>
        <Button.Root onClick={reset}>Try again</Button.Root>
      </body>
    </html>
  );
};

export default GlobalError;
