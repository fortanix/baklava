/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Panel } from '../../containers/Panel/Panel.tsx';
import { type TabProps, Tabs, Tab } from './Tabs.tsx';


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

const defaultTabOptions: Array<TabProps> = [1,2,3,4].map(index => ({ tabKey: `${index}`, title: `Tab ${index}` }));

type TabWithTriggerProps = React.PropsWithChildren<Partial<TabsArgs>> & {
  options?: undefined | Array<TabProps>,
  defaultActiveTabKey?: undefined | string,
};
const TabWithTrigger = (props: TabWithTriggerProps) => {
  const { options = defaultTabOptions, defaultActiveTabKey, ...tabContext } = props;
  
  const [activeTabKey, setActiveTabKey] = React.useState<undefined | string>(defaultActiveTabKey ?? '1');
  
  return (
    <Tabs onSwitch={setActiveTabKey} activeKey={activeTabKey} {...tabContext}>
      {options.map(tabProps => {
        return (
          <Tab
            key={tabProps.tabKey}
            render={() => <>Tab {tabProps.tabKey} contents</>}
            {...tabProps}
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

export const TabsStandard: StoryWithTrigger = {
  ...BaseStory,
  args: { ...BaseStory.args },
};

export const TabsWithDefaultActive: StoryWithTrigger = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    defaultActiveTabKey: '2',
  },
};

export const TabsWithHover: StoryWithTrigger = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    options: defaultTabOptions.map(option => {
      if (option.tabKey === '1') {
        return {
          ...option,
          className: 'pseudo-hover',
        };
      }
      return option;
    }),
  },
};

export const TabsWithFocus: StoryWithTrigger = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    options: defaultTabOptions.map(option => {
      if (option.tabKey === '1') {
        return {
          ...option,
          className: 'pseudo-focus-visible',
        };
      }
      return option;
    }),
  },
};

export const SecondaryTabs: StoryWithTrigger = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    variant: 'secondary',
  },
};

export const VerticalTabs: StoryWithTrigger = {
  ...BaseStory,
  decorators: [Story => <Panel><Story /></Panel>],
  args: {
    ...BaseStory.args,
    orientation: 'vertical',
  },
};

/**
 * In the following story, each tab should have a `data-label` attribute on their respective tab panels and buttons.
 */
export const TabsWithCustomProps: StoryWithTrigger = {
  ...BaseStory,
  args: {
    ...BaseStory.args,
    options: defaultTabOptions.map(option => ({
      ...option,
      'data-label': `tab-content-${option.tabKey}`,
      tabTriggerProps: {
        'data-label': `tab-trigger-${option.tabKey}`,
      },
    })),
  },
};
