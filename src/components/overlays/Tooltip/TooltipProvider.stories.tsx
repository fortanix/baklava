/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';
import { Draggable } from '../../../util/drag.ts';

import { TooltipProvider } from './TooltipProvider.tsx';
import { TooltipIcon, TooltipItem, TooltipTitle } from './Tooltip.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';
import { Card } from '../../containers/Card/Card.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';


type TooltipProviderArgs = React.ComponentProps<typeof TooltipProvider>;
type Story = StoryObj<TooltipProviderArgs>;

export default {
  component: TooltipProvider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    tooltip: <>This is a tooltip</>,
    children: (props) => <Button {...props()} kind="primary" label="Hover over me"/>,
  },
  render: (args) => <TooltipProvider {...args}/>,
} satisfies Meta<TooltipProviderArgs>;


export const TooltipProviderStandard: Story = {};

export const TooltipProviderWithHoverAction: Story = {
  args: {
    triggerAction: 'hover',
  },
};

export const TooltipProviderWithClickAction: Story = {
  args: {
    triggerAction: 'click',
    children: (props) => <Button {...props()} kind="primary" label="Click me"/>,
  },
};

export const TooltipProviderWithFocusAction: Story = {
  args: {
    triggerAction: 'focus',
    children: (props) => <Button {...props()} kind="primary" label="Focus me"/>,
  },
};

export const PlacementTop: Story = {
  args: {
    placement: 'top',
  },
};

export const PlacementBottom: Story = {
  args: {
    placement: 'bottom',
  },
};

export const PlacementLeft: Story = {
  args: {
    placement: 'left',
  },
};

export const PlacementRight: Story = {
  args: {
    placement: 'right',
  },
};

export const TooltipSmall: Story = {
  args: {
    size: 'small',
    tooltip: <>
      <TooltipTitle>Title</TooltipTitle>
      <TooltipItem>Lorem ipsum</TooltipItem>
      <TooltipItem>Lorem ipsum</TooltipItem>
    </>,
  },
};

export const TooltipMedium: Story = {
  args: {
    placement: 'right',
    size: 'medium',
    tooltip: <>
      <TooltipTitle>Title</TooltipTitle>
      <TooltipItem alert={true}>
        <TooltipIcon icon="status-failed" />
        Lorem ipsum
      </TooltipItem>
      <TooltipItem>
        <TooltipIcon icon="copy" />
        Lorem ipsum
      </TooltipItem>
    </>,
  },
};

export const TooltipLarge: Story = {
  args: {
    placement: 'left',
    size: 'large',
    tooltip: <>A large tooltip will have a fixed size,<br />even if the content is small.</>,
  },
};

/**
 * When a tooltip hits the viewport during scroll, it will automatically reposition to be visible.
 */
export const TooltipWithScroll: Story = {
  render: () => (
    <>
      <OverflowTester openDefault lines={5}/>
     
      <TooltipProvider tooltip="Tooltips will auto-reposition when it hits the viewport due to scroll.">
        {props => <Button {...props()} kind="primary" label="Scroll me" autoFocus/>}
      </TooltipProvider>
      
      <OverflowTester openDefault/>
    </>
  ),
};


/**
 * When a tooltip appears next to the card header with a long string.
 */
export const TooltipInCardHeader: Story = {
  render: () => {
    const tooltipText = `
      This tooltip appears next to the card header icon and provides additional context or guidance.

      It auto-repositions if it reaches the edge of the viewport (e.g., when scrolling or on small screens).

      This message also includes a very long string with no spaces to test overflow behavior:
      ThisIsAVeryLongStringWithoutAnySpacesToTestWhetherWeHandleWordBreaksCorrectlyWhenTheTextOverflowsTheContainingElement.
    `;

    return (
      <Card>
        <Card.Heading>
          Card Header with Tooltip
          <TooltipProvider tooltip={tooltipText}>
            <Icon icon="info" />
          </TooltipProvider>
        </Card.Heading>
      </Card>
    );
  },
};

/**
 * Tooltips should activate on focus.
 */
export const TooltipWithFocus: Story = {
  args: {
    tooltip: 'Tooltips will open when the anchor element is focused',
    children: (props) => <Button {...props()} kind="primary" label="Focus me" autoFocus/>,
  },
};

const TooltipWithDrag = () => {
  const boundaryRef = React.useRef<React.ComponentRef<'div'>>(null);
  const [boundaryRendered, setBoundaryRendered] = React.useState(false);
  
  React.useEffect(() => {
    if (boundaryRef.current && !boundaryRendered) { setBoundaryRendered(true); }
  }, [boundaryRendered]);
  
  return (
    <div ref={boundaryRef} style={{ minHeight: 400, display: 'grid', placeContent: 'center' }}>
      {boundaryRef.current &&
        <Draggable<HTMLButtonElement>>
          {({ targetRef }) =>
            <TooltipProvider
              tooltip="The position of this tooltip will update to stay in view as it gets dragged towards
                the viewport."
              boundary={boundaryRef.current ?? undefined}
              enablePreciseTracking
            >
              <Button ref={targetRef} kind="secondary" label="Drag me" autoFocus/>
            </TooltipProvider>
          }
        </Draggable>
      }
    </div>
  );
};
export const TooltipDraggable: Story = {
  parameters: {
    layout: 'fullscreen',
  },
  name: 'Tooltip (draggable anchor)',
  render: () => <TooltipWithDrag/>,
};

export const TooltipEmpty: Story = {
  args: {
    tooltip: '',
  },
};

export const TooltipNull: Story = {
  args: {
    tooltip: null,
  },
};
