/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { type TabKey, TabsEmbedded } from './TabsEmbedded.tsx';


type TabsEmbeddedArgs = React.ComponentProps<typeof TabsEmbedded>;
type Story = StoryObj<TabsEmbeddedArgs>;

const TabsEmbeddedControlledC = (props: TabsEmbeddedArgs) => {
  const [activeTab, setActiveTab] = React.useState<TabKey>(props.active);
  return <TabsEmbedded {...props} active={activeTab} onSwitch={setActiveTab}/>;
};

export default {
  component: TabsEmbedded,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
  },
  render: (args) => <TabsEmbeddedControlledC {...args}/>,
} satisfies Meta<TabsEmbeddedArgs>;


export const TabsEmbeddedStandard: Story = {
  args: {
    active: 'tab-2',
    children: Array.from({ length: 5 }, (_, i) => i + 1).map(tabIndex =>
      <TabsEmbedded.Tab
        key={tabIndex}
        data-label={`tab-${tabIndex}`}
        tabKey={`tab-${tabIndex}`}
        title={`Tab ${tabIndex}`}
      >
        Tab {tabIndex} contents
      </TabsEmbedded.Tab>
    ),
  },
};

export const TabsEmbeddedWithFocus: Story = {
  args: {
    active: 'tab-2',
    children: Array.from({ length: 5 }, (_, i) => i + 1).map(tabIndex =>
      <TabsEmbedded.Tab
        key={tabIndex}
        data-label={`tab-${tabIndex}`}
        tabKey={`tab-${tabIndex}`}
        title={`Tab ${tabIndex}`}
        className={tabIndex === 3 ? 'pseudo-focus-visible' : undefined}
      >
        Tab {tabIndex} contents
      </TabsEmbedded.Tab>
    ),
  },
};
