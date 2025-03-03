/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ListBoxLazy } from './ListBoxLazy.tsx';


type ListBoxLazyArgs = React.ComponentProps<typeof ListBoxLazy>;
type Story = StoryObj<ListBoxLazyArgs>;

export default {
  component: ListBoxLazy,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    limit: 5,
    onUpdateLimit: () => {},
  },
  render: (args) => <ListBoxLazy {...args}/>,
} satisfies Meta<ListBoxLazyArgs>;


export const ListBoxLazyStandard: Story = {
  args: {
    count: 10_000,
  }
};

export const ListBoxLazyLoading: Story = {
  args: {
    count: 5,
    isLoading: true,
  }
};


const ListBoxLazyInfiniteC = (props: ListBoxLazyArgs) => {
  const pageSize = 10;
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [limit, setLimit] = React.useState(pageSize);
  const [items, setItems] = React.useState([]);
  
  React.useEffect(() => {
    if (items.length < limit) {
      setIsLoading(true);
      window.setTimeout(() => {
        setItems(Array.from({ length: limit }));
        setIsLoading(false);
      }, 600);
    }
  }, [limit]);
  
  return (
    <ListBoxLazy
      {...props}
      limit={limit}
      pageSize={pageSize}
      onUpdateLimit={setLimit}
      count={items.length}
      isLoading={isLoading}
      renderItem={item => <>Item {item.index + 1}</>}
    />
  );
};
export const ListBoxLazyInfinite: Story = {
  render: args => <ListBoxLazyInfiniteC {...args}/>,
  args: {
  }
};
