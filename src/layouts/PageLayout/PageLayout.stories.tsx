/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../../components/actions/Button/Button.tsx';
import { Input } from '../../components/forms/controls/Input/Input.tsx';
import { Select } from '../../components/forms/controls/Select/Select.tsx';
import { Tabs, Tab } from '../../components/navigations/Tabs/Tabs.tsx';

import { PageLayout } from './PageLayout.tsx';


type PageLayoutArgs = React.ComponentProps<typeof PageLayout>;
type Story = StoryObj<PageLayoutArgs>;

export default {
  component: PageLayout,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  render: args => <PageLayout {...args}/>,
} satisfies Meta<PageLayoutArgs>;

const title1 = 'Page Title';
const actions1 = (
  <>
    <Button kind="tertiary">Tertiary Button</Button>
    <Button kind="secondary">Secondary Button</Button>
    <Button kind="primary">Primary Button</Button>
  </>
);
const CustomInput: React.ComponentProps<typeof Select>['Input'] = props => (
  <Input {...props} icon="bell" iconLabel="Bell"/>
);
const projects = {
  p1: 'Connection/Project name',
  p2: 'Connection/Project name 2',
  p3: 'Connection/Project name 3',
};
const selectOptions = (
  Object.entries(projects).map(([projectKey, projectName]) =>
    <Select.Option key={projectKey} itemKey={projectKey} label={projectName}/>
  )
);
const title2 = (
  <Select
    label="Select project"
    placeholder="Select project"
    defaultSelected={projects.p1}
    options={selectOptions}
    Input={CustomInput}
    automaticResize
  />
);

const header1 = (
  <PageLayout.Header title={title1}>
    {actions1}
  </PageLayout.Header>
);

const header2 = (
  <PageLayout.Header titleSelect={title2}>
    {actions1}
  </PageLayout.Header>
);

const body = (
  <PageLayout.Body>
    <p>Content Area. Notice this has no external padding and no breadcrumbs; those are added by AppLayout.</p>
  </PageLayout.Body>
);

type DefaultTabOption = {
  index: number,
  className?: string,
};
const defaultTabOptions: DefaultTabOption[] = [1,2,3,4].map(index => { 
  return { index };
});

type TabsArgs = React.ComponentProps<typeof Tabs>;
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
            render={() => <PageLayout.Body>Tab {tab.index} contents</PageLayout.Body>}
            className={tab.className}
          />
        )
      })}
    </Tabs>
  );
};

// TODO: The defaultActiveTabKey option is not working atm
// See https://github.com/fortanix/baklava/issues/261
const tabs1 = (
  <TabWithTrigger defaultActiveTabKey="1" />
);

export const PageLayoutStandard: Story = {
  args: {
    children: (
      <>
        {header1}
        {body}
      </>
    ),
  },
};

export const PageLayoutScopeSwitcher: Story = {
  args: {
    children: (
      <>
        {header2}
        {body}
      </>
    ),
  },
};

export const PageLayoutTabs: Story = {
  args: {
    children: (
      <>
        {header1}
        {tabs1}
      </>
    ),
  },
  play: async () => {
    // Workaround to manually click on the first tab.
    // TODO: Remove once https://github.com/fortanix/baklava/issues/261 is fixed
    (document.querySelector("li[data-tab]") as HTMLElement).click();
  },
};
