import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTable } from './DataTable';

type Row = { id: string; name: string };

describe('DataTable', () => {
  it('renders column headers and row cells', () => {
    render(
      <DataTable<Row>
        caption="Members"
        getRowId={(row) => row.id}
        columns={[
          { id: 'name', header: 'Name', cell: (row) => row.name },
        ]}
        rows={[{ id: '1', name: 'Alex' }]}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  it('shows empty message when there are no rows', () => {
    render(
      <DataTable<Row>
        getRowId={(row) => row.id}
        columns={[{ id: 'name', header: 'Name', cell: (row) => row.name }]}
        rows={[]}
        emptyMessage="No members"
      />,
    );

    expect(screen.getByText('No members')).toBeInTheDocument();
  });
});
