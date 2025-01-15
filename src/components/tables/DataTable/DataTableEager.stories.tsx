/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import { differenceInDays } from 'date-fns';
import React from 'react';

import { delay } from '../util/async_util.ts';
import { type User, generateData } from '../util/generateData.ts';
import { useEffectAsync } from '../util/hooks.ts';
import { sortDateTime } from '../util/sorting_util.ts';
import * as Filtering from './filtering/Filtering.ts';
import type { Fields, FilterQuery } from '../MultiSearch/filterQuery.ts';

import { Panel } from '../../containers/Panel/Panel.tsx';
import * as DataTablePlugins from './plugins/useRowSelectColumn.tsx';
import * as DataTableEager from './DataTableEager.tsx';

import './DataTableEager.stories.scss';


const columns = [
  {
    id: 'name',
    accessor: (user: User) => user.name,
    Header: 'Name',
    Cell: ({ value }: { value: string }) => value,
    disableSortBy: false,
    disableGlobalFilter: false,
    className: 'user-table__column',
  },
  {
    id: 'email',
    accessor: (user: User) => user.email,
    Header: 'Email',
    disableSortBy: false,
    disableGlobalFilter: false,
    className: 'user-table__column',
  },
  {
    id: 'company',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: false,
    className: 'user-table__column',
  },
  {
    id: 'joinDate',
    accessor: (user: User) => user.joinDate,
    Header: 'Joined',
    Cell: ({ value }: { value: Date }) =>
      value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    disableSortBy: false,
    sortType: sortDateTime,
    disableGlobalFilter: false,
    className: 'user-table__column',
  },
];

const fields: Fields = {
  name: {
    type: 'text',
    operators: ['$text'],
    label: 'Name',
    placeholder: 'Search name',
  },
  email: {
    type: 'text',
    operators: ['$text'],
    label: 'Email',
    placeholder: 'Search email',
  },
  company: {
    type: 'text',
    operators: ['$text'],
    label: 'Company',
    placeholder: 'Search company',
  },
  joinDate: {
    type: 'datetime',
    operators: ['$lt', '$lte', '$gt', '$gte', '$range'],
    label: 'Joined',
    placeholder: 'Search by joined date',
  },
  daysActive: {
    type: 'number',
    operators: ['$eq', '$ne', '$lt', '$lte', '$gt', '$gte'],
    label: 'Days active',
    placeholder: 'Number of days active',
    accessor: (item: unknown) => differenceInDays(new Date(), (item as User).joinDate),
  },
};

type dataTeableEagerTemplateProps = DataTableEager.TableProviderEagerProps<User> & { delay: number };

const DataTableEagerTemplate = (props: dataTeableEagerTemplateProps) => {
  const memoizedColumns = React.useMemo(() => props.columns, [props.columns]);
  const memoizedItems = React.useMemo(() => props.items, [props.items]);

  const [isReady, setIsReady] = React.useState(props.isReady ?? true);

  useEffectAsync(async () => {
    if (typeof props.delay !== 'number' && isReady === false) return;
    await delay(props.delay);
    setIsReady(true);
  }, [props.delay]);

  return (
    <Panel>
      <DataTableEager.TableProviderEager
        {...props}
        isReady={isReady}
        columns={memoizedColumns}
        items={memoizedItems}
        getRowId={(item: User) => item.id}
      >
        <DataTableEager.Search />
        <DataTableEager.DataTableEager status={{ error: null, loading: false, ready: true }} />
      </DataTableEager.TableProviderEager>
    </Panel>
  );
};

// Template: Table with Filtering
const DataTableEagerWithFilterTemplate = (props: dataTeableEagerTemplateProps) => {
  const memoizedColumns = React.useMemo(() => props.columns, [props.columns]);

  const [filters, setFilters] = React.useState<FilterQuery>([]);
  const [filteredItems, setFilteredItems] = React.useState<User[]>(props.items as User[]);

  // Convert items array into a record
  const itemsAsRecord = React.useMemo(() => {
    return Object.fromEntries(props.items.map(item => [item.id, item])) as Record<string, User>;
  }, [props.items]);
  
  React.useEffect(() => {
    const filtered = Filtering.filterByQuery(fields, itemsAsRecord, filters);
    setFilteredItems(Object.values(filtered) as User[]);
  }, [filters, itemsAsRecord]);

  return (
    <Panel>
      <DataTableEager.TableProviderEager
        {...props}
        columns={memoizedColumns}
        items={filteredItems}
        getRowId={(item: User) => item.id}
        plugins={[DataTablePlugins.useRowSelectColumn]}
      >
        <DataTableEager.DataTableEager status={{ error: null, loading: false, ready: true }} />
      </DataTableEager.TableProviderEager>
    </Panel>
  );
};

export default {
  component: DataTableEager.DataTableEager,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

// Stories
export const Empty = {
  args: {
    columns,
    items: generateData({ numItems: 0 }),
  },
  render: (args: dataTeableEagerTemplateProps) => <DataTableEagerTemplate {...args} />,
};

export const SinglePage = {
  args: {
    columns,
    items: generateData({ numItems: 5 }),
  },
  render: (args: dataTeableEagerTemplateProps) => <DataTableEagerTemplate {...args} />,
};

export const MultiplePagesSmall = {
  args: {
    columns,
    items: generateData({ numItems: 45 }),
  },
  render: (args: dataTeableEagerTemplateProps) => <DataTableEagerTemplate {...args} />,
};

export const MultiplePagesLarge = {
  args: {
    columns,
    items: generateData({ numItems: 1000 }),
  },
  render: (args: dataTeableEagerTemplateProps) => <DataTableEagerTemplate {...args} />,
};

export const SlowNetwork = {
  args: {
    columns,
    items: generateData({ numItems: 1000 }),
    delay: 1500,
    isReady: false,
  },
  render: (args: dataTeableEagerTemplateProps) => <DataTableEagerTemplate {...args} />,
};

export const InfiniteDelay = {
  args: {
    columns,
    items: generateData({ numItems: 10 }),
    delay: Number.POSITIVE_INFINITY,
    isReady: false,
  },
  render: (args: dataTeableEagerTemplateProps) => <DataTableEagerTemplate {...args} />,
};

export const WithFilter = {
  args: {
    columns,
    items: generateData({ numItems: 45 }),
  },
  render: (args: dataTeableEagerTemplateProps) => <DataTableEagerWithFilterTemplate {...args} />,
};

const moreColumns = [
  ...columns, 
  {
    id: 'dummy_1',
    accessor: (user: User) => user.name,
    Header: 'Name',
    Cell: ({ value }: { value: string }) => value,
    disableSortBy: false,
    disableGlobalFilter: true,
  },
  {
    id: 'dummy_2',
    accessor: (user: User) => user.email,
    Header: 'Email',
    disableSortBy: false,
    disableGlobalFilter: true,
  },
  {
    id: 'dummy_3',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
  },
  {
    id: 'dummy_4',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
  },
  {
    id: 'dummy_5',
    accessor: (user: User) => user.company,
    Header: 'Company',
    disableSortBy: false,
    disableGlobalFilter: true,
  },
];
export const WithScroll = {
  args: {
    columns: moreColumns,
    items: generateData({ numItems: 45 }),
    className: 'teas'
  },
  render: (args: dataTeableEagerTemplateProps) => <DataTableEagerWithFilterTemplate {...args} />,
};
