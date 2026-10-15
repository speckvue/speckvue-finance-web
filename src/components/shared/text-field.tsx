'use client';

import * as Input from '@/components/ui/input';
import type { Props } from './form-field';
import FormField from './form-field';

const TextField = ({
  id,
  label,
  errors = [],
  hint,
  trailing,
  ...props
}: Omit<Props, 'children'> & { trailing?: React.ReactNode } & Omit<
    React.ComponentProps<typeof Input.Input>,
    'id'
  >) => {
  return (
    <FormField id={id} label={label} errors={errors} hint={hint}>
      <Input.Root
        hasError={errors.length > 0}
        className={trailing ? 'divide-x-0' : undefined}
      >
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
        {trailing}
      </Input.Root>
    </FormField>
  );
};

export default TextField;
