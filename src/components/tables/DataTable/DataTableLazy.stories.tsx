/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { StoryObj } from '@storybook/react-vite';

import { delay } from '../util/async_util.ts';
import { type User, generateData } from '../util/generateData.ts';
import { sortDateTime } from '../util/sorting_util.ts';

import { Button } from '../../actions/Button/Button.tsx';
import { PageLayout } from '../../../layouts/PageLayout/PageLayout.tsx';
import { Panel } from '../../containers/Panel/Panel.tsx';
import * as DataTableLazy from './DataTableLazy.tsx';

export default {
  component: DataTableLazy.DataTableLazy,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

type DataTableLazyTemplateProps = DataTableLazy.TableProviderLazyProps<User> & {
  delay: number,
  storyItems: Array<User>,
};
const DataTableLazyTemplate = (props: DataTableLazyTemplateProps) => {
  const columns = React.useMemo(() => props.columns, [props.columns]);
  const items = React.useMemo(() => props.storyItems, [props.storyItems]);
  const delayQuery = props.delay ?? null;

  const [itemsProcessed, setItemsProcessed] = React.useState<DataTableLazy.DataTableQueryResult<User>>({
    total: 0,
    itemsPage: [],
  });

  const query: DataTableLazy.DataTableQuery<User> = React.useCallback(
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
                <Button kind="secondary" onPress={() => {}}>Action 1</Button>
                <Button kind="primary" onPress={() => {}}>Action 2</Button>
              </DataTableLazy.PlaceholderEmptyAction>
            }
          />
        }
      />
    </DataTableLazy.TableProviderLazy>
  );
};
type Story = StoryObj<typeof DataTableLazyTemplate>;

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
export const Empty: Story = {
  args: {
    columns,
    storyItems: generateData({ numItems: 0 }),
  },
  render: (args: DataTableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const SinglePage: Story = {
  args: {
    columns,
    storyItems: generateData({ numItems: 10 }),
  },
  render: (args: DataTableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const MultiplePagesSmall: Story = {
  args: {
    columns,
    storyItems: generateData({ numItems: 45 }),
  },
  render: (args: DataTableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const MultiplePagesLarge: Story = {
  args: {
    columns,
    storyItems: generateData({ numItems: 1000 }),
  },
  render: (args: DataTableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const SlowNetwork: Story = {
  args: {
    columns,
    storyItems: generateData({ numItems: 1000 }),
    delay: 1500,
  },
  render: (args: DataTableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const InfiniteDelay: Story = {
  args: {
    columns,
    storyItems: generateData({ numItems: 50 }),
    delay: Number.POSITIVE_INFINITY,
  },
  render: (args: DataTableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const StatusFailure: Story = {
  args: {
    columns,
    storyItems: generateData({ numItems: 1000 }),
    delay: -1,
  },
  render: (args: DataTableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
  decorators: [Story => <Panel><Story/></Panel>],
};

export const DataTableLazyWithPageLayout: Story = {
  args: {
    columns,
    storyItems: generateData({ numItems: 45 }),
  },
  render: (args: DataTableLazyTemplateProps) => <DataTableLazyTemplate {...args} />,
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
