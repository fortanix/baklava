/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { LoremIpsum } from '../../../util/storybook/LoremIpsum.tsx';

import { Button } from '../../actions/Button/Button.tsx';

import { SpinnerModal } from './SpinnerModal.tsx';


type SpinnerModalArgs = React.ComponentProps<typeof SpinnerModal>;
type Story = StoryObj<SpinnerModalArgs>;

export default {
  component: SpinnerModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  render: (args) => <><LoremIpsum paragraphs={5}/><SpinnerModal {...args}/></>,
} satisfies Meta<SpinnerModalArgs>;


export const SpinnerModalStandard: Story = {};

const SpinnerModalControlledWithTrigger = (props: SpinnerModalArgs) => {
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (isLoading) {
      globalThis.setTimeout(() => { setIsLoading(false); }, 3000);
    }
  }, [isLoading]);
  
  return (
    <>
      {isLoading && <SpinnerModal delay={0} {...props}/>}
      <LoremIpsum paragraphs={2}/>
      <Button kind="primary" label="Trigger spinner for 3 seconds" onPress={() => { setIsLoading(true); }}/>
      <LoremIpsum paragraphs={2}/>
    </>
  );
};
export const SpinnerModalWithTrigger: Story = {
  render: (args) => <SpinnerModalControlledWithTrigger {...args}/>,
};
