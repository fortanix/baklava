/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';
import { Draggable } from '../../../util/drag.ts';

import { TooltipProvider } from './TooltipProvider.tsx';
import { TooltipIcon, TooltipItem, TooltipTitle } from './Tooltip.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { Icon } from '../../graphics/Icon/Icon.tsx';
import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';


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
    tooltip: 'This is a tooltip',
    children: (props) => <Button {...props()} variant="primary" label="Hover over me"/>,
  },
  render: (args) => <TooltipProvider {...args}/>,
} satisfies Meta<TooltipProviderArgs>;


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
        <TooltipIcon icon="alert" />
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
        {props => <Button {...props()} variant="primary" label="Scroll me" autoFocus/>}
      </TooltipProvider>
      
      <OverflowTester openDefault/>
    </>
  ),
};

/**
 * Tooltips should activate on focus.
 */
export const TooltipWithFocus: Story = {
  args: {
    tooltip: 'Tooltips will open when the anchor element is focused',
    children: (props) => <Button {...props()} variant="primary" label="Focus me" autoFocus/>,
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
              <Button ref={targetRef} variant="secondary" label="Drag me" autoFocus/>
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
