/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../../util/storybook/LoremIpsum.tsx';

import { Button } from '../../buttons/Button.tsx';

import { Modal } from './Modal.tsx';


type ModalArgs = React.ComponentProps<typeof Modal>;
type Story = StoryObj<ModalArgs>;

const ModalWithTrigger = (props: Omit<React.ComponentProps<typeof Modal>, 'active'>) => {
  const [active, setActive] = React.useState(false);
  return (
    <>
      <Button primary onClick={() => { setActive(true); }}>Open modal</Button>
      <Modal active={active} {...props} onClose={() => { setActive(false); props.onClose?.(); }}/>
    </>
  );
};

export default {
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {},
  args: {
    title: 'Modal title',
    children: <LoremIpsum paragraphs={3}/>,
  },
  render: args => <ModalWithTrigger {...args}/>,
} satisfies Meta<ModalArgs>;


export const ModalStandard: Story = {};

export const ModalFixedWidth: Story = { args: { fixedWidth: true } };

export const ModalSmall: Story = { args: { small: true } };
export const ModalMedium: Story = { args: { medium: true } };
export const ModalLarge: Story = { args: { large: true } };

export const ModalLoading: Story = { args: { isLoading: true } };
