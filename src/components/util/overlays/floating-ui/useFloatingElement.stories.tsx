/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react-vite';

import * as React from 'react';

import { Button } from '../../../actions/Button/Button.tsx';

import { useFloatingElementNative } from './useFloatingElementNative.tsx';


const FloatingElement = (props: {}) => {
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
  } = useFloatingElementNative();
  
  return (
    <>
      <style>{`
        @scope {
          [popover] {
            padding: 1em;
            background: steelblue;
            
            /* Entry/exit animation */
            transition: none 100ms ease-in allow-discrete;
            transition-property: display, overlay, opacity;
            &:not(:popover-open) { opacity: 0; }
            @starting-style { opacity: 0; }
          }
        }
      `}</style>
      
      <Button kind="primary" {...getReferenceProps()} ref={refs.setReference}>Click me</Button>
      {isMounted &&
        <div popover="manual" {...getFloatingProps()} ref={refs.setFloating}>This is a popover</div>
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
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
  },
  render: (args) => <FloatingElement {...args}/>,
  decorators: [
    Story => (
      <div style={{ height: '5lh', overflowBlock: 'auto' }}>
        <div style={{ height: '100vh', display: 'grid', placeContent: 'center' }}>
          <Story/>
        </div>
      </div>
    ),
  ],
} satisfies Meta<FloatingElementArgs>;


export const FloatingElementNative: Story = {
};
