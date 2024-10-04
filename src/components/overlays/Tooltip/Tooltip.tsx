/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Tooltip.module.scss';


export { cl as TooltipClassNames };

export type TooltipProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
}>;
/**
 * A tooltip. Used by `TooltipProvider` to display a tooltip popover.
 */
export const Tooltip = ({ unstyled = false, ...propsRest }: TooltipProps) => {
  return (
    <div
      role="tooltip" // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tooltip_role
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-tooltip']]: !unstyled,
        'bk-body-text': !unstyled,
      }, propsRest.className)}
    />
  );
};
