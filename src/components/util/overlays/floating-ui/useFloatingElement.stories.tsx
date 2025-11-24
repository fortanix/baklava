/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { mergeRefs } from '../../../../util/reactUtil.ts';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../../actions/Button/Button.tsx';
import { Input } from '../../../forms/controls/Input/Input.tsx';

import { type UseFloatingElementOptions, useFloatingElement } from './useFloatingElement.tsx';


const css = String.raw; // Dummy template literal for syntax highlighting

type FloatingElementControlledProps = {
  label: string,
  popoverContent?: undefined | React.ReactNode,
  options: UseFloatingElementOptions,
};
const FloatingElementControlled = (props: FloatingElementControlledProps) => {
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
  } = useFloatingElement(props.options);
  
  //console.log('r', getReferenceProps());
  //console.log('f', getFloatingProps());
  
  // Merge everything into one props object for reference/floating
  const referenceProps = getReferenceProps();
  // @ts-ignore
  referenceProps.ref = mergeRefs(referenceProps.ref, refs.setReference);
  const floatingProps = getFloatingProps();
  // @ts-ignore
  floatingProps.ref = mergeRefs(floatingProps.ref, refs.setFloating);
  floatingProps.style = { ...floatingStyles, ...(floatingProps.style ?? {}) };
  
  return (
    <>
      <style>{css`
        @scope {
          [popover] {
            padding: 1em;
            background: light-dark(#ddd, #555);
            text-align: center;
            border-radius: 3px;
            
            p:not(:first-child) {
              margin-top: 0.6lh;
            }
            
            /* FIXME: the following causes a weird issue in Safari where the popover remains at 'opacity: 0' */
            /* Entry/exit animation */
            transition: none 100ms ease-in allow-discrete;
            transition-property: display, overlay, opacity;
            &:not(:popover-open) { opacity: 0; }
            @starting-style { opacity: 0; }
          }
        }
      `}</style>
      
      <Button {...referenceProps} kind="primary" label={props.label}/>
      {isMounted &&
        <div {...floatingProps}>{props.popoverContent ?? 'This is a popover'}</div>
      }
    </>
  );
};

type FloatingElementControlledArgs = React.ComponentProps<typeof FloatingElementControlled>;
type Story = StoryObj<FloatingElementControlledArgs>;

export default {
  title: 'components/overlays/util/FloatingElement',
  component: FloatingElementControlled,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
  args: {
    label: 'Open popover',
  },
  render: (args) => <FloatingElementControlled {...args}/>,
  decorators: [
    Story => (
      // <div style={{ height: '5lh', overflowBlock: 'auto' }}>
        // <div style={{ height: '100vh', display: 'grid', placeContent: 'center' }}>
          <Story/>
        // </div>
      // </div>
    ),
  ],
} satisfies Meta<FloatingElementControlledArgs>;


export const FloatingElement: Story = {
  args: { label: 'Click me' },
};

export const FloatingElementWithPlacementTop: Story = {
  args: { options: { placement: 'top' }, },
};
export const FloatingElementWithPlacementRight: Story = {
  args: { options: { placement: 'right' } },
};
export const FloatingElementWithPlacementBottom: Story = {
  args: { options: { placement: 'bottom' } },
};
export const FloatingElementWithPlacementLeft: Story = {
  args: { options: { placement: 'left' }, },
};

export const FloatingElementWithOffset: Story = {
  args: { options: { offset: 8 }, },
};

export const FloatingElementWithTriggerClick: Story = {
  args: { label: 'Click me', options: { triggerAction: 'click' }, },
};
export const FloatingElementWithTriggerHover: Story = {
  args: { label: 'Hover over me', options: { triggerAction: 'hover' }, },
};
export const FloatingElementWithTriggerFocus: Story = {
  args: { label: 'Focus me', options: { triggerAction: 'focus' }, },
};
export const FloatingElementWithTriggerFocusInteractive: Story = {
  decorators: [
    Story => (
      <div>
        <style>{css`@scope { text-align: center; }`}</style>
        <Story/>
        <p><Button label="Focus target (should close active popover)"/></p>
      </div>
    ),
  ],
  args: {
    label: 'Focus me',
    popoverContent: (
      <>
        <p>Clicking this static text will lose focus, but it should not close the popover.</p>
        <p><Button kind="primary" label="This button should be next in the tab order"/></p>
        <p><Input defaultValue="Focusing elements within the popover should not cause it to close"/></p>
        <p>Clicking outside the anchor/popover should trigger a close.</p>
        <p>Tabbing beyond the popover should also trigger a close.</p>
      </>
    ),
    options: { triggerAction: 'focus' },
  },
};
