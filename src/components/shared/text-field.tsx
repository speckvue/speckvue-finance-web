'use client';

import * as Input from '@/components/ui/input';
import type { Props } from './form-field';
import FormField from './form-field';

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

export default TextField;
