/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { generateData } from '../../util/generateData.ts';

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { DataTable } from './DataTable.tsx';


type DataTableArgs = React.ComponentProps<typeof DataTable>;
type Story = StoryObj<DataTableArgs>;

export default {
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    children: 'Example',
  },
  render: (args) => <DataTable {...args}/>,
} satisfies Meta<DataTableArgs>;


const columns1 = {
  name: {
    id: 'name',
    accessor: user => user.name,
    Header: 'Name',
    Cell: ({ value }) =>
      <DummyLink className="bkl-data-table__item__name">{value}</DummyLink>,
    disableSortBy: false,
    disableGlobalFilter: false,
  },
  email: {
    id: 'email',
    accessor: user => user.email,
    Header: 'Email',
    disableSortBy: false,
    disableGlobalFilter: false,
  },
  company: {
    id: 'company',
    accessor: user => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: false,
  },
  joinDate: {
    id: 'joinDate',
    accessor: user => user.joinDate,
    Header: 'Joined',
    Cell: ({ value }) =>
      value.toLocaleDateString(
        'en-US',
        { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' },
      ),
    disableSortBy: false,
    disableGlobalFilter: true,
  },
};

export const DataTableStandard: Story = {
  args: {
    columns: columns1,
  },
};
