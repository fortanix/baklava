/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { delay } from '../util/async_util.ts';
import { sortDateTime } from '../util/sorting_util.ts';

import * as React from 'react';
import { type Column } from 'react-table';

import type { StoryObj } from '@storybook/react-vite';
import { generateData, type User } from '../util/generateData.ts';

import { Banner } from '../../containers/Banner/Banner.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Panel } from '../../containers/Panel/Panel.tsx';
import { PageLayout } from '../../../layouts/PageLayout/PageLayout.tsx';
import * as DataTableStream from './DataTableStream.tsx';
import {
  useRowSelectColumn,
  useRowSelectColumnRadio,
} from './plugins/useRowSelectColumn.tsx';


export default {
  component: DataTableStream.DataTableStream,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: {
      type: { name: 'string', required: false },
      description: 'CSS class name',
      control: { type: 'text' },
    },
    columns: {
      type: { name: 'array', required: true },
      description: 'Table columns',
      control: { type: 'object' },
    },
    endOfStream: {
      type: { name: 'boolean', required: false },
      description: 'End of stream flag',
      control: { type: 'boolean' },
    },
  },
};

type UserPageState = {
  offsetTasks: number,
  offsetApprovalRequests: number,
};

type DataTableStreamTemplateProps = DataTableStream.TableProviderStreamProps<User> & {
  delay: number,
  items: Array<User>,
  endOfStream: boolean,
  dataTableProps: React.ComponentProps<typeof DataTableStream.DataTableStream>,
  renderTableActions?: undefined | ((ctx: { refetch: () => void }) => React.ReactNode),
};

const DataTableStreamTemplate = ({ dataTableProps, children, renderTableActions, ...props }: DataTableStreamTemplateProps) => {
  const columns = React.useMemo(() => props.columns, [props.columns]);
  const items = React.useMemo(() => props.items, [props.items]);
  const delayQuery = props.delay ?? null;

  const [itemsProcessed, setItemsProcessed] = React.useState<Array<User>>([]);

  const query: DataTableStream.DataTableQuery<User, UserPageState | null> = React.useCallback(
    async ({ previousItem, previousPageState, limit, orderings, globalFilter }) => {
      if (delayQuery === Number.POSITIVE_INFINITY) { return new Promise(() => {}); } // Infinite delay
      if (delayQuery === -1) { throw new Error('Failed'); } // Simulate failure

      if (delayQuery) { await delay(delayQuery); }
      
      let offset = 0;

      if (previousItem) {
        const previousItemIndex = items.indexOf(previousItem);
        offset = previousItemIndex === -1 ? 0 : previousItemIndex + 1;
      }

      const filteredItems = items
        .filter((row) => {
          if (!globalFilter || globalFilter.trim() === '') { return true; }

          const columnsFilterable = columns.filter((column) => !column.disableGlobalFilter);
          if (!columnsFilterable.length) { return false; }

          return columnsFilterable.some((column) => {
            const cell = typeof column.accessor === 'function'
              ? column.accessor(row, 0, { subRows: [], depth: 0, data: [row] })
              : undefined;
            return typeof cell === 'string' && cell.toLowerCase().includes(globalFilter.trim().toLowerCase());
          });
        })
        .sort((a, b) => {
          if (!orderings[0]) { return 0; }
          const { column, direction } = orderings[0];
          const factor = direction === 'DESC' ? -1 : 1;

          const aValue = a[column as keyof User];
          const bValue = b[column as keyof User];
        
          const aNormalized = aValue instanceof Date ? aValue.toISOString() : aValue?.toString();
          const bNormalized = bValue instanceof Date ? bValue.toISOString() : bValue?.toString();
        
          return (aNormalized?.localeCompare(bNormalized) || 0) * factor;
        })
        .slice(offset, offset + limit);

      return { itemsPage: filteredItems, pageState: null, isEndOfStream: props.endOfStream };
    },
    [items, columns, props.endOfStream, delayQuery]
  );

  return (
    <DataTableStream.TableProviderStream
      {...props}
      columns={columns}
      query={query}
      items={itemsProcessed}
      updateItems={setItemsProcessed}
      initialState={{ sortBy: [{ id: 'name', desc: false }] }}
    >
      {children}
      {renderTableActions?.({
        refetch: () => setItemsProcessed(prev => [...prev]),
      })}
      <DataTableStream.Search />
      <DataTableStream.DataTableStream
        placeholderEmpty={
          <DataTableStream.DataTablePlaceholderEmpty
            icon="file"
            title="No users"
            actions={
              <DataTableStream.PlaceholderEmptyAction>
                <Button kind="secondary" onPress={() => {}}>Action 1</Button>
                <Button kind="primary" onPress={() => {}}>Action 2</Button>
              </DataTableStream.PlaceholderEmptyAction>
            }
          />
        }
        {...dataTableProps}
      />
    </DataTableStream.TableProviderStream>
  );
};

type Story = StoryObj<typeof DataTableStreamTemplate>;

// Column definitions
const columnDefinitions: Array<Column<User>> = [
  {
    id: 'name',
    accessor: (user: User) => user.name,
    Header: 'Name',
    Cell: ({ value }: { value: string }) => value,
    disableSortBy: false,
    disableGlobalFilter: false,
  },
  {
    id: 'email',
    accessor: (user: User) => user.email,
    Header: 'Email',
    disableSortBy: false,
    disableGlobalFilter: false,
  },
  {
    id: 'company',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: false,
  },
  {
    id: 'joinDate',
    accessor: (user: User) => user.joinDate,
    Header: 'Joined',
    Cell: ({ value }: { value: Date }) =>
      value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    sortType: sortDateTime,
    disableSortBy: false,
    disableGlobalFilter: true,
  },
];

const columnDefinitionsMultiple: Array<Column<User>> = [
  {
    id: 'name',
    accessor: (user: User) => user.name,
    Header: 'Name',
    Cell: ({ value }: { value: string }) => value,
    disableSortBy: false,
    disableGlobalFilter: false,
    bkColumnWidth: {
      flex: 2,
      width: '30ch',
    },
  },
  {
    id: 'email',
    accessor: (user: User) => user.email,
    Header: 'Email',
    disableSortBy: false,
    disableGlobalFilter: false,
  },
  {
    id: 'company',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: false,
    bkColumnWidth: {
      flex: 2,
      width: '15ch',
    },
  },
  {
    id: 'joinDate',
    accessor: (user: User) => user.joinDate,
    Header: 'Joined',
    Cell: ({ value }: { value: Date }) =>
      value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    sortType: sortDateTime,
    disableSortBy: false,
    disableGlobalFilter: true,
  },

  {
    id: 'dummy_1',
    accessor: (user: User) => user.name,
    Header: 'Name',
    Cell: ({ value }: { value: string }) => value,
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_2',
    accessor: (user: User) => user.email,
    Header: 'Email',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_3',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
    bkColumnWidth: {
      flex: 2,
      width: '15ch',
    },
  },
  {
    id: 'dummy_4',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
    bkColumnWidth: {
      flex: 2,
      width: '15ch',
    },
  },
  {
    id: 'dummy_5',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_6',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_7',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_8',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_9',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_10',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_11',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_12',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'dummy_13',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
    className: 'user-table__column',
  },
  {
    id: 'actions',
    accessor: () => null,
    Header: 'Actions',
    disableSortBy: true,
    disableGlobalFilter: true,
    className: 'user-table__column',
    bkColumnWidth: {
      flex: 0,
      width: '8ch',
    }
  },  
];

// Stories
export const Empty: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 0 }),
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const SinglePage: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 10 }),
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const MultiplePagesSmall: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 45 }),
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const MultiplePagesLarge: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 1000 }),
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const SlowNetwork: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 1000 }),
    delay: 1500,
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const InfiniteDelay: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 50 }),
    delay: Number.POSITIVE_INFINITY,
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const StatusFailure: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 1000 }),
    delay: -1,
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const WithEndOfTablePlaceholder: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 15 }),
    dataTableProps: {
      placeholderEndOfTable: <Banner variant="info" title="You have reached the end of the table" />
    },
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const WithExplicitEndOfStream: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 15 }),
    endOfStream: false,
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

const ScrollWrapper = ({ children } : { children: React.ReactNode }) => {
  return (
    <div style={{ width: '58vw' }}>
      {children}
    </div>
  );
};

export const WithScroll: Story = {
  args: {
    columns: columnDefinitionsMultiple,
    items: generateData({ numItems: 6 }),
  },
  render: (args: DataTableStreamTemplateProps) => <ScrollWrapper><DataTableStreamTemplate {...args} /></ScrollWrapper>,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const WithScrollAndStickyNameColumn: Story = {
  args: {
    columns: columnDefinitionsMultiple,
    items: generateData({ numItems: 6 }),
    stickyColumns: 'first'
  },
  render: (args: DataTableStreamTemplateProps) => <ScrollWrapper><DataTableStreamTemplate {...args} /></ScrollWrapper>,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const WithScrollAndStickyNameColumnWithCheckboxSelection: Story = {
  args: {
    columns: columnDefinitionsMultiple,
    items: generateData({ numItems: 6 }),
    stickyColumns: 'first',
    plugins: [useRowSelectColumn]
  },
  render: (args: DataTableStreamTemplateProps) => <ScrollWrapper><DataTableStreamTemplate {...args} /></ScrollWrapper>,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const WithScrollAndStickyNameColumnWithRadioSelection: Story = {
  args: {
    columns: columnDefinitionsMultiple,
    items: generateData({ numItems: 6 }),
    stickyColumns: 'first',
    plugins: [useRowSelectColumnRadio]
  },
  render: (args: DataTableStreamTemplateProps) => <ScrollWrapper><DataTableStreamTemplate {...args} /></ScrollWrapper>,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const WithPluginIssueResolvedUsingFlagInjection: Story = {
  args: {
    columns: columnDefinitionsMultiple,
    items: generateData({ numItems: 6 }),
    stickyColumns: 'first',
    plugins: [useRowSelectColumnRadio],
    renderTableActions: ({ refetch }) => (
      <Button onPress={refetch}>
        Force Re-render
      </Button>
    ),
  },
  render: (args: DataTableStreamTemplateProps) =>
    <ScrollWrapper><DataTableStreamTemplate {...args} /></ScrollWrapper>,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const WithScrollAndStickyNameAndActions: Story = {
  args: {
    columns: columnDefinitionsMultiple,
    items: generateData({ numItems: 6 }),
    stickyColumns: 'both'
  },
  render: (args: DataTableStreamTemplateProps) => <ScrollWrapper><DataTableStreamTemplate {...args} /></ScrollWrapper>,
  decorators: [Story => <Panel><Story/></Panel>],
};

const LoadingSpinnerTrigger = () => {
  const table = DataTableStream.useTable();
  
  if (!table.status.ready) {
    return null;
  }
  
  return (
    <Button
      kind="secondary"
      onPress={() => { table.reload() }}
      style={{ marginBottom: '2rem' }}
    >
      Show Loading spinner
    </Button>
  );
};

export const WithScrollAndSpinner: Story = {
  args: {
    columns: [
      {
        id: 'id',
        accessor: (user: User) => user.id,
        Header: 'Id',
        Cell: ({ value }: { value: string }) => value,
        disableSortBy: false,
        disableGlobalFilter: false,
        bkColumnWidth: {
          flex: 1,
          width: '60ch',
        },
      },
      {
        id: 'name',
        accessor: (user: User) => user.name,
        Header: 'Name',
        Cell: ({ value }: { value: string }) => value,
        disableSortBy: false,
        disableGlobalFilter: false,
        bkColumnWidth: {
          flex: 1,
          width: '30ch',
        },
      },
      {
        id: 'description',
        accessor: (user: User) => user.dummy_5,
        Header: 'Job Description',
        Cell: ({ value }: { value: string }) => value,
        disableSortBy: false,
        disableGlobalFilter: false,
        bkColumnWidth: {
          flex: 1,
          width: '30ch',
        },
      },
    ],
    items: generateData({ numItems: 15 }),
    stickyColumns: 'first',
    delay: 2500,
  },
  render: (args: DataTableStreamTemplateProps) => (
    <ScrollWrapper>
      <DataTableStreamTemplate {...args}>
        <LoadingSpinnerTrigger />
      </DataTableStreamTemplate>
    </ScrollWrapper>
  ),
  decorators: [Story => <Panel><Story/></Panel>],
};

export const DataTableStreamWithPageLayout: Story = {
  args: {
    columns: columnDefinitions,
    items: generateData({ numItems: 45 }),
  },
  render: (args: DataTableStreamTemplateProps) => <DataTableStreamTemplate {...args} />,
  decorators: [
    Story => (
      <PageLayout>
        <PageLayout.Header title={<PageLayout.Heading>PageLayout with edgeless parameter</PageLayout.Heading>}/>
        <PageLayout.Body edgeless={true}>
          <Story/>
        </PageLayout.Body>
      </PageLayout>
    ),
  ],
};
