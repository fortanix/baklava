/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { DummyLink } from '../../../util/storybook/StorybookLink.tsx';
import { OverflowTester } from '../../../util/storybook/OverflowTester.tsx';

import { Button } from '../../actions/Button/Button.tsx';

import { Tooltip } from './Tooltip.tsx';


type TooltipArgs = React.ComponentProps<typeof Tooltip>;
type Story = StoryObj<TooltipArgs>;

export default {
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
  },
  args: {
    children: 'This is a tooltip',
  },
  render: (args) => <Tooltip {...args}/>,
} satisfies Meta<TooltipArgs>;


export const TooltipStandard: Story = {
  name: 'Tooltip',
  args: {
    style: {},
  },
};

export const TooltipWithArrow: Story = {
  args: {
    arrow: 'bottom',
  },
};

export const TooltipSmall: Story = {
  args: {
    size: 'small',
  },
};

export const TooltipMedium: Story = {
  args: {
    size: 'medium',
  },
};

export const TooltipLarge: Story = {
  args: {
    size: 'large',
  },
};

export const TooltipWordBreak: StoryObj<typeof Tooltip> = {
  name: 'Tooltip (word break)',
  render: () => (
    <Tooltip>
      LoremipsumdolorsitametconsecteturadipiscingelitPellentesqueegetsemutnequelobortispharetranecvelquamEtiamsemnequegravidasedpharetrautvehiculaquislectusDonecacrhoncuspurus.
    </Tooltip>
  ),
};

export const TooltipScroll: StoryObj<typeof Tooltip> = {
  name: 'Tooltip (scroll)',
  render: () => (
    <Tooltip>
      <p>
        Lorem ipsum dolor sit amet, <DummyLink>consectetur</DummyLink> adipiscing elit. Pellentesque eget sem ut neque lobortis pharetra nec vel quam. Etiam sem neque, gravida sed pharetra ut, vehicula quis lectus. Donec ac rhoncus purus. Proin ultricies augue vitae purus feugiat, in ultrices lorem aliquet. Donec eleifend ac dolor a auctor.
      </p>
      <p>
        Cras ac suscipit nibh. Fusce tincidunt iaculis dapibus. Vivamus sit amet neque eu velit tincidunt semper. Donec at magna aliquam mi consectetur imperdiet. Donec pretium placerat quam, in sodales purus porta vitae. Phasellus nisl justo, luctus vel mi vel, sollicitudin.
      </p>
      <ul>
        <li>A list item</li>
        <li>Another list item</li>
      </ul>
    </Tooltip>
  ),
};

const TooltipNativeAnchoringControlled = () => {
  // Note: in the future, browsers will support implicit anchors (`position-anchor: implicit`) so that the invoker
  // will be used automatically as the anchor. For now, we need to hook them up using an anchor name.
  // Alternatively, wrap both popover+invoker in an element with `anchor-scope` (but wrappers interfere with styling).
  // https://www.w3.org/TR/css-anchor-position-1/#implicit
  const id = React.useId();
  const anchorName = `--bk-tooltip-anchor-${CSS.escape(id)}`;
  const refTooltip = React.useRef<React.ComponentRef<typeof Tooltip>>(null);
  
  return (
    <>
      <OverflowTester/>
      
      <Tooltip ref={refTooltip} id={id} popover="manual" style={{ positionAnchor: anchorName }}>
        This is a tooltip with a lot of text that gives more information about the element.
        It has a <DummyLink>link</DummyLink> you can focus.
      </Tooltip>
      <Button popoverTarget={id} variant="primary" label="Hover over me"
        style={{ anchorName }}
        onMouseEnter={() => { refTooltip.current?.showPopover(); }}
        onMouseLeave={() => { refTooltip.current?.hidePopover(); }}
      />
      
      <OverflowTester/>
    </>
  );
};
export const TooltipNativeAnchoring: Story = {
  name: 'Tooltip (native browser)',
  render: () => (
    <TooltipNativeAnchoringControlled/>
  ),
};
