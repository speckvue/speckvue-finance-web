'use client';

import * as Button from '@/components/ui/button';

const Feedback = ({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) => {
  return (
    <section
      className="flex flex-col items-center gap-3 p-10 text-center"
      aria-live="polite"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-text-sub-600">{description}</p>
      {action && onAction && (
        <Button.Root variant="neutral" mode="stroke" onClick={onAction}>
          {action}
        </Button.Root>
      )}
    </section>
  );
};

export default Feedback;
