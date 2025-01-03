/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assertUnreachable } from '../../../util/types.ts';
import * as React from 'react';
import { ClassNameArgument, classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { useScroller } from '../../../layouts/util/Scroller.tsx';

import { Icon, IconProps } from '../../graphics/Icon/Icon.tsx';

import cl from './Tooltip.module.scss';


export { cl as TooltipClassNames };

export type TooltipSize = 'small' | 'medium' | 'large';

export type TooltipArrowPosition = 'top' | 'right' | 'bottom' | 'left';

export type TooltipProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether this tooltip should be rendered compact (minimal padding). */
  compact?: undefined | boolean,
  
  /** Whether you want the component to have a fixed width. If unset, it will have dynamic size. */
  size?: undefined | TooltipSize,
  
  /* If specified, will render an arrow at the given position. */
  arrow?: undefined | TooltipArrowPosition,
}>;
/**
 * A tooltip. Used by `TooltipProvider` to display a tooltip popover.
 */
export const Tooltip = (props: TooltipProps) => {
  const {
    children,
    unstyled = false,
    compact = false,
    arrow,
    size = undefined,
    ...propsRest
  } = props;
  
  const scrollerProps = useScroller();
  
  const arrowClassNames = ((): ClassNameArgument => {
    if (!arrow) { return; }
    
    switch (arrow) {
      case 'top': return cx(cl['bk-tooltip--arrow'], cl['bk-tooltip--arrow-top']);
      case 'right': return cx(cl['bk-tooltip--arrow'], cl['bk-tooltip--arrow-right']);
      case 'bottom': return cx(cl['bk-tooltip--arrow'], cl['bk-tooltip--arrow-bottom']);
      case 'left': return cx(cl['bk-tooltip--arrow'], cl['bk-tooltip--arrow-left']);
      default: return assertUnreachable(arrow);
    }
  })();
  
  return (
    <div
      role="tooltip" // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tooltip_role
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-tooltip']]: !unstyled, },
        { [cl['bk-tooltip--compact']]: compact },
        { [cl['bk-tooltip--small']]: size === 'small' },
        { [cl['bk-tooltip--medium']]: size === 'medium' },
        { [cl['bk-tooltip--large']]: size === 'large' },
        arrowClassNames,
        propsRest.className,
      )}
    >
      <div {...scrollerProps} className={cx(cl['bk-tooltip__content'], 'bk-body-text', scrollerProps.className)}>
        {children}
      </div>
    </div>
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
