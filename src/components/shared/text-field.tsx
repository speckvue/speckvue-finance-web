/**
 * @fileoverview Composes an AlignUI input with the shared field wrapper.
 *
 * Provides consistent text entry, labeling, and validation feedback.
 *
 * @author Speckvue contributors
 * @license LicenseRef-Speckvue-Proprietary
 */

'use client';

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import * as Input from '@/components/ui/input';

import FormField from './form-field';

import type { Props } from './form-field';

// ---------------------------------------------------------------------------
// Main implementation
// ---------------------------------------------------------------------------

const TextField = ({
  id,
  label,
  errors = [],
  hint,
  ...props
}: Omit<Props, 'children'> &
  Omit<React.ComponentProps<typeof Input.Input>, 'id'>) => {
  return (
    <FormField id={id} label={label} errors={errors} hint={hint}>
      <Input.Root hasError={errors.length > 0}>
        <Input.Wrapper>
          <Input.Input
            id={id}
            aria-invalid={errors.length > 0}
            aria-describedby={
              errors.length > 0 || hint ? `${id}-feedback` : undefined
            }
            {...props}
          />
        </Input.Wrapper>
      </Input.Root>
    </FormField>
  );
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default TextField;

// ---------------------------------------------------------------------------
