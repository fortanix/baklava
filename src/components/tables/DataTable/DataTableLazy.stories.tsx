/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState, useMemo, useCallback } from 'react';

import { delay } from '../util/async_util.ts';
import { type User, generateData } from '../util/generateData.ts';
import { sortDateTime } from '../util/sorting_util.ts';

import { Button } from '../../actions/Button/Button.tsx';
import { Panel } from '../../containers/Panel/Panel.tsx';
import * as DataTableLazy from './DataTableLazy.tsx';

export default {
  component: DataTableLazy.DataTableLazy,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

type dataTeableLazyTemplateProps = DataTableLazy.TableProviderLazyProps<User> & { delay: number, items: Array<User> };
const DataTableLazyTemplate = (props: dataTeableLazyTemplateProps) => {
  const columns = useMemo(() => props.columns, [props.columns]);
  const items = useMemo(() => props.items, [props.items]);
  const delayQuery = props.delay ?? null;

  const [itemsProcessed, setItemsProcessed] = useState<DataTableLazy.DataTableQueryResult<User>>({ total: 0, itemsPage: [] });

  const query: DataTableLazy.DataTableQuery<User> = useCallback(
    async ({ pageIndex, pageSize }) => {
      if (delayQuery === Number.POSITIVE_INFINITY) return new Promise(() => {}); // Infinite delay
      if (delayQuery === -1) throw new Error('Failed'); // Simulate failure

      if (delayQuery) await delay(delayQuery);

      // Simulate failure on page 4
      if (typeof delayQuery === 'number' && delayQuery > 0 && pageIndex + 1 === 4) {
        throw new Error('Failed');
      }

      const itemsProcessedPage = items.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

      return { total: items.length, itemsPage: itemsProcessedPage };
    },
    [items, delayQuery]
  );

  return (
    <Panel>
      <DataTableLazy.TableProviderLazy
        {...props}
        columns={columns}
        items={itemsProcessed}
        updateItems={setItemsProcessed}
        query={query}
      >
        <DataTableLazy.Search />
        <DataTableLazy.DataTableLazy
          placeholderEmpty={
            <DataTableLazy.DataTablePlaceholderEmpty
              icon="file"
              title="No users"
              actions={
                <DataTableLazy.PlaceholderEmptyAction>
                  <Button variant="secondary" onPress={() => {}}>Action 1</Button>
                  <Button variant="primary" onPress={() => {}}>Action 2</Button>
                </DataTableLazy.PlaceholderEmptyAction>
              }
            />
          }
        />
      </DataTableLazy.TableProviderLazy>
    </Panel>
  );
};

// Column definitions
const columns = [
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
    disableGlobalFilter: false,
  },
];

// Stories
export const Empty = {
  args: {
    columns,
    items: generateData({ numItems: 0 }),
  },
  render: (args: dataTeableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
};

export const SinglePage = {
  args: {
    columns,
    items: generateData({ numItems: 10 }),
  },
  render: (args: dataTeableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
};

export const MultiplePagesSmall = {
  args: {
    columns,
    items: generateData({ numItems: 45 }),
  },
  render: (args: dataTeableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
};

export const MultiplePagesLarge = {
  args: {
    columns,
    items: generateData({ numItems: 1000 }),
  },
  render: (args: dataTeableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
};

export const SlowNetwork = {
  args: {
    columns,
    items: generateData({ numItems: 1000 }),
    delay: 1500,
  },
  render: (args: dataTeableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
};

export const InfiniteDelay = {
  args: {
    columns,
    items: generateData({ numItems: 50 }),
    delay: Number.POSITIVE_INFINITY,
  },
  render: (args: dataTeableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
};

export const StatusFailure = {
  args: {
    columns,
    items: generateData({ numItems: 1000 }),
    delay: -1,
  },
  render: (args: dataTeableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
};
