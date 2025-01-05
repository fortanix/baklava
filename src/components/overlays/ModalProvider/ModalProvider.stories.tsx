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
  tags: ['autodocs'],
  component: ModalProvider,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
  },
  args: {
  },
  render: (args) => <ModalProvider {...args}/>,
} satisfies Meta<ModalProviderArgs>;


export const ModalProviderStandard: Story = {
  args: {
    children: ({ activate }) => <Button variant="primary" label="Open modal" onPress={activate}/>,
    dialog: ({ close, dialogProps }) =>
      <Dialog {...dialogProps} title="Modal dialog" onRequestClose={close}><LoremIpsum paragraphs={5}/></Dialog>,
  },
};

export const ModalProviderWithBasicDialog: Story = {
  args: {
    children: ({ activate }) => <Button variant="primary" label="Open modal" onPress={activate}/>,
    dialog: ({ close, dialogProps }) => <dialog {...dialogProps}>Content</dialog>,
  },
};

const ModalProviderAutoOpen = (props: React.ComponentProps<typeof ModalProvider>) => {
  const ref = ModalProvider.useRef(null);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: want to only trigger this once
    React.useEffect(() => {
    globalThis.setTimeout(() => {
      ref.current?.activate();
    }, 2000);
  }, []);
  
  return <ModalProvider ref={ref} {...props}/>;
};
export const ModalProviderWithRef: Story = {
  render: args => <ModalProviderAutoOpen {...args}/>,
  args: {
    children: () => <>Modal will open automatically after 2 seconds.</>,
    dialog: ({ dialogProps }) =>
      <dialog aria-modal="true" {...dialogProps}>This modal was opened through a ref.</dialog>,
  }
};
