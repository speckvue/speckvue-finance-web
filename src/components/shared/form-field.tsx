'use client';

import * as Hint from '@/components/ui/hint';
import * as Label from '@/components/ui/label';

export type Props = {
  id: string;
  label: string;
  errors?: readonly string[];
  children: React.ReactNode;
  hint?: string;
};

const FormField = ({ id, label, errors = [], children, hint }: Props) => {
  return (
    <div className="space-y-2">
      <Label.Root htmlFor={id}>{label}</Label.Root>
      {children}
      {errors.length > 0 ? (
        <Hint.Root
          hasError
          id={`${id}-feedback`}
          role="alert"
          className="text-red-800 dark:text-red-300"
        >
          {errors.join(' ')}
        </Hint.Root>
      ) : hint ? (
        <Hint.Root id={`${id}-feedback`}>{hint}</Hint.Root>
      ) : null}
    </div>
  );
};

export default FormField;
