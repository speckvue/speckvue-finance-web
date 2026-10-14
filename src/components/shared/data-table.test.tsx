import DataTable from '@/components/shared/data-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';

it('filters rows and offers recovery from an empty search', async () => {
  render(
    <DataTable
      data={[
        { id: '1', name: 'Salary' },
        { id: '2', name: 'Rent' },
      ]}
      columns={[{ accessorKey: 'name', header: 'Name' }]}
      getRowId={(row) => row.id}
      caption="Examples"
    />,
  );
  const user = userEvent.setup();
  await user.type(
    screen.getByRole('textbox', { name: 'Search records' }),
    'missing',
  );
  expect(screen.getByText('No records found')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(screen.getByText('Salary')).toBeVisible();
  expect(screen.getByText('Rent')).toBeVisible();
});
