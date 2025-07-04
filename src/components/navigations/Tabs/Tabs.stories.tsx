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
  options?: undefined | Array<DefaultTabOption>,
  defaultActiveTabKey?: undefined | string,
};
const TabWithTrigger = (props: TabWithTriggerProps) => {
  const { options = defaultTabOptions, defaultActiveTabKey, ...tabContext } = props;
  
  const [activeTabKey, setActiveTabKey] = React.useState<undefined | string>(defaultActiveTabKey);
  
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
type StoryWithTrigger = StoryObj<TabWithTriggerProps>;

const BaseStory: StoryWithTrigger = {
  args: {},
  render: (args) => <TabWithTrigger {...args} />,
};

export const Standard: StoryWithTrigger = {
  ...BaseStory,
  name: 'Standard',
  args: { ...BaseStory.args },
};

// TODO: This seems to not work atm
// See https://github.com/fortanix/baklava/issues/261
export const StandardDefaultActive: StoryWithTrigger = {
  ...BaseStory,
  name: 'Standard [default active]',
  args: {
    ...BaseStory.args,
    defaultActiveTabKey: '1',
  },
};

export const StandardHover: StoryWithTrigger = {
  ...BaseStory,
  name: 'Standard [hover]',
  args: {
    ...BaseStory.args,
    options: defaultTabOptions.map(option => {
      if (option.index === 1) {
        return {
          ...option,
          className: 'pseudo-hover',
        };
      }
      return option;
    }),
  },
};

export const StandardFocus: StoryWithTrigger = {
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
