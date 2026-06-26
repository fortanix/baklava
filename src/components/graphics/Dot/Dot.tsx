/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import cl from './Dot.module.scss';


export { cl as DotClassNames };

export type DotEvent = 'critical' | 'informational' | 'success' | 'warning';
export type DotVariant = 'filled';

export type DotProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Type of Dot to be returned, for now only filled is supported. */
  variant?: undefined | DotVariant,
  
  /** An event type for the dot. When applied, the dot will be styled as per the preset event type. */
  event?: undefined | DotEvent,
};
export const Dot = ({ event, variant = 'filled', unstyled, ...propsRest }: DotProps) => (
  <span
    {...propsRest}
    className={cx(
      { [cl['bk-dot']]: !unstyled },
      { [cl['bk-dot--variant-filled']]: variant === 'filled' },
      { [cl[`bk-dot--event-${event}`]]: typeof event === 'string' },
      propsRest.className,
    )}
    // biome-ignore lint/correctness/noChildrenProp: We explicitly want to override `children`.
    children={null}
  />
);
