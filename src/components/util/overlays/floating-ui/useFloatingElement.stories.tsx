/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { mergeRefs } from '../../../../util/reactUtil.ts';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../../actions/Button/Button.tsx';
import { Input } from '../../../forms/controls/Input/Input.tsx';
import { Icon } from '../../../graphics/Icon/Icon.tsx';

import { type UseFloatingElementOptions, useFloatingElement } from './useFloatingElement.tsx';


type FloatingElementControlledProps = {
  renderAnchor: (props: Record<string, unknown>) => React.ReactNode,
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
      <style>{`
        @scope {
          [popover] {
            padding: 1em;
            background: light-dark(#ddd, #555);
            text-align: center;
            border-radius: 3px;
            
            p:not(:first-child) {
              margin-top: 0.6lh;
            }
            
            /* Entry/exit animation */
            --transition-props: opacity;
            transition: none 100ms ease-in allow-discrete;
            transition-property: display, overlay, var(--transition-props);
            &:not(:popover-open) { opacity: 0; }
            
            /*
            Safari (at least v26.0) supports 'transition-property: display allow-discrete', but it does not support
            the 'overlay' property. This means that our exit animations are broken in this browser, because during the
            exit animation the popover will no longer be in the top layer ("overlay"). Note: we cannot feature detect
            support for discrete 'display', so we will instead feature detect support for 'overlay'.
            See: https://codepen.io/maikelkrause/pen/qEZybQX
            */
            @supports not (overlay: auto) {
              transition-property: var(--transition-props); /* Exclude 'display' and 'overlay' */
            }
            
            @starting-style { opacity: 0; }
          }
        }
      `}</style>
      
      {props.renderAnchor(referenceProps)}
      {isMounted &&
        <div {...floatingProps}>{props.popoverContent ?? 'This is a popover'}</div>
      }
    </>
  );
};

const buttonAnchor = (label: string) =>
  (props: Record<string, unknown>) => <Button {...props} kind="primary" label={label}/>;

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
    renderAnchor: buttonAnchor('Open popover'),
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


export const FloatingElementStandard: Story = {
  args: { renderAnchor: buttonAnchor('Click me') },
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
  args: { renderAnchor: buttonAnchor('Click me'), options: { triggerAction: 'click' }, },
};
export const FloatingElementWithTriggerHover: Story = {
  args: { renderAnchor: buttonAnchor('Hover over me'), options: { triggerAction: 'hover' }, },
};
export const FloatingElementWithTriggerFocus: Story = {
  args: { renderAnchor: buttonAnchor('Focus me'), options: { triggerAction: 'focus' }, },
};
export const FloatingElementWithTriggerFocusInteractive: Story = {
  decorators: [
    Story => (
      <div>
        <style>{`@scope { text-align: center; }`}</style>
        <Story/>
        <p><Button label="Focus target (should close active popover)"/></p>
      </div>
    ),
  ],
  args: {
    renderAnchor: buttonAnchor('Focus me'),
    popoverContent: (
      <>
        <p>Clicking this static text will lose focus, but it should not close the popover.</p>
        <p><Button kind="primary" label="This button should be next in the tab order"/></p>
        <p><Input defaultValue="Focusing elements within the popover should not cause it to close"/></p>
        <p>Clicking outside the anchor/popover should trigger a close.</p>
        <p>Tabbing beyond the popover should also trigger a close.</p>
      </>
    ),
    options: { triggerAction: 'focus-interactive' },
  },
};


/**
 * HTML popover expects the `source` element (the anchor) to be a focusable element. If a non-interactive element like
 * a `<div>` without a `tabindex` is passed, then the automatic tab order will fail.
 */
export const FloatingElementWithNoninteractiveAnchor: Story = {
  decorators: [
    Story => (
      <div>
        <style>{`@scope { text-align: center; }`}</style>
        <Story/>
        <p><Button label="Focus target"/></p>
      </div>
    ),
  ],
  args: {
    renderAnchor: props => <div {...props}>Click me</div>,
    popoverContent: (
      <>
        <p><Button kind="primary" label="This button will not be next in the tab order"/></p>
      </>
    ),
    options: { triggerAction: 'click' },
  },
};

/**
 * HTML popover expects the `source` element (the anchor) to be an HTML element. If a non-HTML element, like an SVG
 * element is passed instead, `useFloatingElement` should still work however there will be no `source` (and thus no
 * tab ordering or implicit anchor). (Note: in Chrome at least, the tab ordering does still seem to work here?)
 */
export const FloatingElementWithSVGAnchor: Story = {
  decorators: [
    Story => (
      <div>
        <style>{`@scope { text-align: center; }`}</style>
        <p><Button label="Focus target"/></p>
        <Story/>
        <p><Button label="Focus target"/></p>
      </div>
    ),
  ],
  args: {
    renderAnchor: props => <Icon {...props} icon="bell"/>,
    popoverContent: (
      <>
        <p><Button kind="primary" label="This button will not be next in the tab order"/></p>
      </>
    ),
    options: { triggerAction: 'click' },
  },
};


export const FloatingElementWithPopoverAuto: Story = {
  args: { renderAnchor: buttonAnchor('Click me'), options: { popoverBehavior: 'auto' } },
};
