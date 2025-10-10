/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../../actions/Button/Button.tsx';

import { type UseFloatingElementOptions, useFloatingElementNative } from './useFloatingElementNative.tsx';


const FloatingElement = (props: { label: string, options: UseFloatingElementOptions }) => {
  const {
    isOpen,
    setIsOpen,
    isMounted,
    refs,
    placement,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    getItemProps,
  } = useFloatingElementNative(props.options);
  
  return (
    <>
      <style>{`
        @scope {
          [popover] {
            padding: 1em;
            background: steelblue;
            
            /* FIXME: the following causes a weird issue in Safari where the popover remains at 'opacity: 0' */
            /* Entry/exit animation */
            transition: none 100ms ease-in allow-discrete;
            transition-property: display, overlay, opacity;
            &:not(:popover-open) { opacity: 0; }
            @starting-style { opacity: 0; }
          }
        }
      `}</style>
      
      <Button kind="primary" {...getReferenceProps()}>{props.label}</Button>
      {isMounted &&
        <div {...getFloatingProps()}>This is a popover</div>
      }
    </>
  );
};

type FloatingElementArgs = React.ComponentProps<typeof FloatingElement>;
type Story = StoryObj<FloatingElementArgs>;

export default {
  title: 'components/overlays/util/FloatingElement',
  component: FloatingElement,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    label: 'Click me',
  },
  render: (args) => <FloatingElement {...args}/>,
  decorators: [
    Story => (
      // <div style={{ height: '5lh', overflowBlock: 'auto' }}>
        // <div style={{ height: '100vh', display: 'grid', placeContent: 'center' }}>
          <Story/>
        // </div>
      // </div>
    ),
  ],
} satisfies Meta<FloatingElementArgs>;


export const FloatingElementNative: Story = {};

export const FloatingElementNativeWithPlacementTop: Story = {
  args: { options: { placement: 'top' }, },
};
export const FloatingElementNativeWithPlacementRight: Story = {
  args: { options: { placement: 'right' } },
};
export const FloatingElementNativeWithPlacementBottom: Story = {
  args: { options: { placement: 'bottom' } },
};
export const FloatingElementNativeWithPlacementLeft: Story = {
  args: { options: { placement: 'left' }, },
};

export const FloatingElementNativeWithOffset: Story = {
  args: { options: { offset: 8 }, },
};

export const FloatingElementNativeWithTriggerHover: Story = {
  args: { label: 'Hover over me', options: { triggerAction: 'hover' }, },
};
export const FloatingElementNativeWithTriggerFocus: Story = {
  args: { label: 'Focus me', options: { triggerAction: 'focus' }, },
};
