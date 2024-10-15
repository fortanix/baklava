/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Meta, StoryObj } from '@storybook/react';

import * as React from 'react';
import { Draggable } from '../../../util/drag.ts';

import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';
import { Button } from '../../actions/Button/Button.tsx';
import { TooltipProvider } from './TooltipProvider.tsx';


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


export const Standard: Story = {};

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
  const boundaryRef = React.useRef<React.ElementRef<'div'>>(null);
  const [boundaryRendered, setBoundaryRendered] = React.useState(false);
  
  React.useEffect(() => {
    if (boundaryRef.current && !boundaryRendered) { setBoundaryRendered(true); }
  }, [boundaryRef.current]);
  
  return (
    <div ref={boundaryRef} style={{ minHeight: 400, display: 'grid', placeContent: 'center' }}>
      {boundaryRef.current &&
        <Draggable>
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
