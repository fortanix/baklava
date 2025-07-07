/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { type TabKey, Tabs } from './Tabs.tsx';


type TabsArgs = React.ComponentProps<typeof Tabs>;
type Story = StoryObj<TabsArgs>;

const TabsControlledC = (props: TabsArgs) => {
  const [activeTab, setActiveTab] = React.useState<TabKey>(props.active);
  return <Tabs {...props} active={activeTab} onSwitch={setActiveTab}/>;
};

export default {
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <TabsControlledC {...args}/>,
} satisfies Meta<TabsArgs>;


export const TabsStandard: Story = {
  args: {
    active: 'tab-2',
    children: Array.from({ length: 5 }, (_, i) => i + 1).map(tabIndex =>
      <Tabs.Tab
        key={tabIndex}
        data-label={`tab-${tabIndex}`}
        tabKey={`tab-${tabIndex}`}
        title={`Tab ${tabIndex}`}
        render={() => <>Tab {tabIndex} contents</>}
      />
    ),
  },
};

export const TabsWithFocus: Story = {
  args: {
    active: 'tab-2',
    children: Array.from({ length: 5 }, (_, i) => i + 1).map(tabIndex =>
      <Tabs.Tab
        key={tabIndex}
        data-label={`tab-${tabIndex}`}
        tabKey={`tab-${tabIndex}`}
        title={`Tab ${tabIndex}`}
        render={() => <>Tab {tabIndex} contents</>}
        className={tabIndex === 3 ? 'pseudo-focus-visible' : undefined}
      />
    ),
  },
};
