/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';

import { Tabs, Tab } from './Tabs.tsx';


type TabsArgs = React.ComponentProps<typeof Tabs>;
type Story = StoryObj<TabsArgs>;

export default {
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    children: 'Example',
  },
  render: (args) => <Tabs {...args}/>,
} satisfies Meta<TabsArgs>;

type DefaultTabOption = {
  index: number,
  className?: string,
};
const defaultTabOptions: DefaultTabOption[] = [1,2,3,4].map(index => { 
  return { index };
});

type TabWithTriggerProps = React.PropsWithChildren<Partial<TabsArgs>> & {
  options: DefaultTabOption[],
  defaultActiveTabKey: string,
};
const TabWithTrigger = (props: TabWithTriggerProps) => {
  const { options = defaultTabOptions, defaultActiveTabKey, ...tabContext } = props;
  const [activeTabKey, setActiveTabKey] = React.useState<string>(defaultActiveTabKey);
  return (
    <Tabs onSwitch={setActiveTabKey} activeKey={activeTabKey} {...tabContext}>
      {options.map(tab => {
        return (
          <Tab
            key={tab.index}
            data-label={`tab${tab.index}`}
            tabKey={`tab${tab.index}`}
            title={`Tab ${tab.index}`}
            render={() => <>Tab {tab.index} contents</>}
            className={tab.className}
          />
        )
      })}
    </Tabs>
  );
};

const BaseStory: Story = {
  args: {},
  render: (args) => <TabWithTrigger {...args} />,
};

export const Standard: Story = {
    ...BaseStory,
  name: 'Standard',
  args: { ...BaseStory.args },
};

export const StandardHover: Story = {
    ...BaseStory,
  name: 'Standard [hover]',
  args: {
    ...BaseStory.args,
    options: defaultTabOptions.map(option => {
      if (option.index === 1) {
        return {
          ...option,
          className: 'pseudo-hover',
        }
      }
      return option;
    }),
  },
};

export const StandardFocus: Story = {
    ...BaseStory,
  name: 'Standard [focus]',
  args: {
    ...BaseStory.args,
    options: defaultTabOptions.map(option => {
      if (option.index === 1) {
        return {
          ...option,
          className: 'pseudo-focus-visible',
        };
      }
      return option;
    }),
    defaultActiveTabKey: 'tab1',
  },
};
