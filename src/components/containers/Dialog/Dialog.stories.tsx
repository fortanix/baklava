/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDecorator } from '../../../util/storybook/LayoutDecorator.tsx';
import { loremIpsum, LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { Button } from '../../actions/Button/Button.tsx';

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
    Story => <LayoutDecorator size="large" style={{ maxHeight: '20lh' }}><Story/></LayoutDecorator>,
  ],
  args: {
    title: 'Dialog title',
    children: <LoremIpsum paragraphs={3}/>,
    actions: (
      <Button variant="primary" label="Submit"/>
    ),
    onRequestClose: () => {},
  },
} satisfies Meta<DialogArgs>;


export const DialogStandard: Story = {};

export const DialogWithoutClose: Story = {
  args: {
    showCloseIcon: false,
  },
};

export const DialogWithFocus: Story = {
  args: {
    className: 'pseudo-focus-visible',
  },
};

export const DialogWithTitleOverflow: Story = {
  args: {
    title: loremIpsum(),
  },
};

export const DialogFlat: Story = {
  args: {
    flat: true,
  },
};
