'use client';

import Feedback from '@/components/shared/feedback';

const ErrorPage = ({
  reset,
}: {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}) => {
  return (
    <Feedback
      title="Something went wrong"
      description="We could not load this page. Please try again."
      action="Try again"
      onAction={reset}
    />
  );
};

export default ErrorPage;
