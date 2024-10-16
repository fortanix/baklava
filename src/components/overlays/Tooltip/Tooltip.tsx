/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Tooltip.module.scss';


export { cl as TooltipClassNames };

export type TooltipSize = 'small' | 'medium' | 'large';

export type TooltipProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  /** Whether you want the component to have a fixed width. If unset, it will have dynamic size. */
  size?: undefined | TooltipSize,
}>;
/**
 * A tooltip. Used by `TooltipProvider` to display a tooltip popover.
 */
export const Tooltip = ({ unstyled = false, size = undefined, ...propsRest }: TooltipProps) => {
  return (
    <div
      role="tooltip" // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tooltip_role
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-tooltip']]: !unstyled,
        'bk-body-text': !unstyled,
        [cl['bk-tooltip--size-small']]: size === 'small',
        [cl['bk-tooltip--size-medium']]: size === 'medium',
        [cl['bk-tooltip--size-large']]: size === 'large',
      }, propsRest.className)}
    />
  );
};
