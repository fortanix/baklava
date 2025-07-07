/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Panel } from './Panel.tsx';
import { H5, H6 } from '../../typography/headings/Headings.tsx';


type PanelArgs = React.ComponentProps<typeof Panel>;
type Story = StoryObj<PanelArgs>;

export default {
  component: Panel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  argTypes: {},
  args: {
    children: 'Panel content',
  },
  render: (args) => <Panel {...args}/>,
} satisfies Meta<PanelArgs>;


export const PanelStandard: Story = {};

export const PanelSecondary: Story = {
  decorators: [
    Story => <Panel>Outer panel<Story/></Panel>,
  ],
  args: {
    secondary: true,
    children: 'Inner panel'
  },
};

export const PanelFlat: Story = { args: { flat: true } };

export const PanelWithHeading: Story = {
  args: {
    children: (
      <>
        <H5 className="bkl-panel__heading">Heading</H5>
        <H6 className="bkl-panel__subheading">Subheading</H6>
        <p>Body</p>
      </>
    ),
  },
};

export const PanelWithColumns: Story = {
  args: {
    secondary: true,
    children: (
      <div className="columns">
        <p>Column 1</p>
        <p>Column 2</p>
      </div>
    ),
  },
};

export const PanelWithSibling: Story = {
    decorators: [
    Story => <><Story/><Panel>Sibling panel</Panel></>,
  ],
  args: {
    children: 'This panel has another panel as a sibling. There should be spacing between the two.',
  },
};
