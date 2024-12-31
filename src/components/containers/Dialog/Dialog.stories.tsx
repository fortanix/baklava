/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';

import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { Dialog } from './Dialog.tsx';


type DialogArgs = React.ComponentProps<typeof Dialog>;
type Story = StoryObj<DialogArgs>;

export default {
  tags: ['autodocs'],
  component: Dialog,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => <LayoutDecorator size="large" style={{ maxHeight: '15lh' }}><Story/></LayoutDecorator>,
  ],
  args: {
    title: 'Dialog title',
    onRequestClose: () => {},
  },
} satisfies Meta<DialogArgs>;


export const DialogStandard: Story = {
  args: {
    children: <LoremIpsum paragraphs={3}/>,
  },
};

export const DialogWithClose: Story = {
  args: {
    children: <LoremIpsum paragraphs={3}/>,
    showCloseAction: true,
  },
};

export const DialogWithFocus: Story = {
  args: {
    className: 'pseudo-focus-visible',
    children: <LoremIpsum paragraphs={3}/>,
    showCloseAction: true,
  },
};

export const DialogFlat: Story = {
  args: {
    children: <LoremIpsum paragraphs={3}/>,
    flat: true,
    showCloseAction: true,
  },
};
