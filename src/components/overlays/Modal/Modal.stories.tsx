/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ModalClassNames as cl } from './Modal.tsx';
import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';
import { Modal } from './Modal.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Spinner } from '../../graphics/Spinner/Spinner.tsx';


type ButtonArgs = React.ComponentProps<typeof Modal>;
type Story = StoryObj<ButtonArgs>;

export default {
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
} satisfies Meta<ButtonArgs>;


type ModalWithTriggerProps = Omit<React.ComponentProps<typeof Modal>, 'active' | 'onClose'> & {
  triggerLabel?: string,
};
const ModalWithTrigger = ({ triggerLabel = 'Open modal', ...modalProps }: ModalWithTriggerProps) => {
  const [active, setActive] = React.useState(false);
  const onClose = React.useCallback(() => { setActive(false); }, [setActive]);
  return (
    <>
      <Button variant="primary" onPress={() => { setActive(true); }}>{triggerLabel}</Button>
      <Modal {...modalProps} active={active} onClose={onClose}/>
    </>
  );
};

export const Interactive: Story = {
  render: () => (
    <ModalWithTrigger>
      <div className="body-text">
        <p>This is a modal</p>
        
        <ModalWithTrigger>
          <div className="body-text">
            <p>This is a submodal</p>
            <OverflowTester/>
          </div>
        </ModalWithTrigger>
        
        <OverflowTester/>
      </div>
    </ModalWithTrigger>
  ),
  play: async ({ canvasElement }) => {},
};

type ModalWithSpinnerTriggerProps = Omit<React.ComponentProps<typeof Modal>, 'active' | 'onClose'> & {
  triggerLabel?: string,
};
const ModalWithSpinnerTrigger = ({ triggerLabel = 'Open modal with spinner (it will close in 5 seconds)', ...modalProps }: ModalWithSpinnerTriggerProps) => {
  const [active, setActive] = React.useState(false);
  const onPress = () => {
    setActive(true);
    setTimeout(() => {
      setActive(false);
    }, 5000);
  }
  const onClose = React.useCallback(() => { setActive(false); }, [setActive]);
  return (
    <>
      <Button variant="primary" onPress={onPress}>{triggerLabel}</Button>
      <Modal {...modalProps} active={active} onClose={onClose} closeable={false} className={cl['bk-modal-spinner']}/>
    </>
  );
};

export const ModalWithSpinner: Story = {
  render: () => (
    <ModalWithSpinnerTrigger>
      <Spinner size="large" />
    </ModalWithSpinnerTrigger>
  ),
  play: async ({ canvasElement }) => {},
};
