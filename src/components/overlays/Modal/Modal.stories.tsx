/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { ModalClassNames as cl } from './Modal.tsx';
import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';
import { Modal, ModalHeader, ModalContent, ModalFooter } from './Modal.tsx';
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

const reusableModalChildren: React.JSX.Element = (
  <>
    <ModalHeader>
      <h1>Modal title</h1>
    </ModalHeader>
    <ModalContent>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do iusmod tempor incididunt ut labore et dolore magna aliqua.</p>

      <ModalWithTrigger triggerLabel="Open Submodal">
        <ModalHeader>
          <h1>Submodal title</h1>
        </ModalHeader>
        <ModalContent>
          <p>This is a submodal</p>
          <OverflowTester/>
        </ModalContent>
      </ModalWithTrigger>

      <OverflowTester/>
    </ModalContent>
    <ModalFooter>This is a modal footer with eventual action buttons</ModalFooter>
  </>
);

export const ModalSizeSmall: Story = {
  render: () => (
    <ModalWithTrigger size="small">
      {reusableModalChildren}
    </ModalWithTrigger>
  ),
};

export const ModalSizeMedium: Story = {
  render: () => (
    <ModalWithTrigger size="medium">
      {reusableModalChildren}
    </ModalWithTrigger>
  ),
};

export const ModalSizeLarge: Story = {
  render: () => (
    <ModalWithTrigger size="large">
      {reusableModalChildren}
    </ModalWithTrigger>
  ),
};

export const ModalSizeXLarge: Story = {
  render: () => (
    <ModalWithTrigger size="x-large">
      {reusableModalChildren}
    </ModalWithTrigger>
  ),
};

export const ModalSizeFullScreen: Story = {
  render: () => (
    <ModalWithTrigger size="fullscreen">
      {reusableModalChildren}
    </ModalWithTrigger>
  ),
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
    <ModalWithSpinnerTrigger size="fullscreen">
      <ModalContent>
        <Spinner size="large" />
      </ModalContent>
    </ModalWithSpinnerTrigger>
  ),
  play: async ({ canvasElement }) => {},
};
