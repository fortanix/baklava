/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon, IconProps } from '../../graphics/Icon/Icon.tsx';

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
        [cl['bk-tooltip--small']]: size === 'small',
        [cl['bk-tooltip--medium']]: size === 'medium',
        [cl['bk-tooltip--large']]: size === 'large',
      }, propsRest.className)}
    />
  );
};

export type TooltipTitleProps = React.PropsWithChildren<ComponentProps<'h1'>>;

/**
 * Tooltip title. Can be optionally used as tooltip children.
 */
export const TooltipTitle = ({ children }: TooltipTitleProps) => (
  <h1 className={cl['bk-tooltip__title']}>{children}</h1>
);

export type TooltipItemProps = React.PropsWithChildren<ComponentProps<'p'> & {
  /** Whether the item is an alert */
  alert?: undefined | boolean;
}>;

/**
 * Tooltip item. Can be optionally used as tooltip children.
 */
export const TooltipItem = ({ alert = false, children }: TooltipItemProps) => (
  <p
    className={cx({
      [cl['bk-tooltip__alert']]: alert,
    })}
  >
    {children}
  </p>
);

/**
 * Tooltip icon. Can be optionally used as tooltip children.
 */
export const TooltipIcon = (props: IconProps) => (
  <Icon className={cl['bk-tooltip__icon']} {...props} />
);
