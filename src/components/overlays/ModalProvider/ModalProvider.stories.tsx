/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { Button } from '../../actions/Button/Button.tsx';
import { Dialog } from '../../containers/Dialog/Dialog.tsx';

import { ModalProvider } from './ModalProvider.tsx';


type ModalProviderArgs = React.ComponentProps<typeof ModalProvider>;
type Story = StoryObj<ModalProviderArgs>;

export default {
  component: ModalProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
  },
  render: (args) => <ModalProvider {...args}/>,
} satisfies Meta<ModalProviderArgs>;


export const ModalProviderStandard: Story = {
  args: {
    children: activate => <Button variant="primary" label="Open modal" onPress={activate}/>,
    content: ({ close, ...props }) =>
      <Dialog {...props} onCloseAction={close}><LoremIpsum paragraphs={5}/></Dialog>,
  },
};

export const ModalProviderWithBasicDialog: Story = {
  args: {
    children: activate => <Button variant="primary" label="Open modal" onPress={activate}/>,
    content: props => <dialog {...props}>Content</dialog>,
  },
};
