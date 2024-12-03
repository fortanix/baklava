/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { DataTable } from './table/DataTable.tsx';


type DataTableArgs = React.ComponentProps<typeof DataTable>;
type Story = StoryObj<typeof DataTable>;



import * as ReactTable from 'react-table';
import { createTableContext, type TableContextState } from './DataTableContext.tsx';
const DataTableContext = ({ children }: React.PropsWithChildren) => {
  type User = { name: string };
  const columns = React.useMemo<Array<ReactTable.Column<User>>>(() => [
    {
      id: 'name',
    }
  ], []);
  const data = React.useMemo<Array<User>>(() => [
    { name: 'Alice' },
  ], []);
  const options = React.useMemo<ReactTable.TableOptions<User>>(() => ({ columns, data }), [columns, data]);
  const table = ReactTable.useTable(options);
  
  const context = React.useMemo<TableContextState<User>>(() => ({
    status: { ready: true, loading: false, error: null },
    setStatus() {},
    reload() {},
    table,
  }), [table.state]);
  // Note: the `table` reference is mutated, so cannot use it as dependency for `useMemo` directly
  
  const TableContext = React.useMemo(() => createTableContext<User>(), []);
  
  return (
    <TableContext.Provider value={context}>
      {children}
    </TableContext.Provider>
  );
};

const DataTableTemplate = (args: DataTableArgs) => {
  type User = { name: string };
  const columns = React.useMemo<Array<ReactTable.Column<User>>>(() => [
    {
      id: 'name',
      getSortByToggleProps() { return {}; },
      Header: 'Name:',
      accessor: (user: User) => user.name,
    }
  ], []);
  const data = React.useMemo<Array<User>>(() => [
    { name: 'Alice' },
  ], []);
  const options = React.useMemo<ReactTable.TableOptions<User>>(() => ({ columns, data }), [columns, data]);
  const table = ReactTable.useTable(
    options,
    ReactTable.useGlobalFilter,
    ReactTable.useFilters,
    ReactTable.useSortBy,
    ReactTable.usePagination,
    ReactTable.useRowSelect,
  );
  
  return (
    <div>
      Table:
      <DataTable
        table={table}
      />
    </div>
  );
};


export default {
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
  },
  render: (args) => (
    <DataTableTemplate {...args}/>
  ),
} satisfies Meta<DataTableArgs>;


export const Standard: Story = {};
