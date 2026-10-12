/**
 * @fileoverview Composes a field label, help text, and validation feedback.
 *
 * Connects reusable form controls to accessible descriptions and errors.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import * as Label from '@/components/ui/label';

import * as Hint from '@/components/ui/hint';

// ---------------------------------------------------------------------------
// Types / Constants
// ---------------------------------------------------------------------------

export type Props = {
  id: string;
  label: string;
  errors?: readonly string[];
  children: React.ReactNode;
  hint?: string;
};

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default FormField;

// ---------------------------------------------------------------------------
