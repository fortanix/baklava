/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Dot.module.scss';


export { cl as DotClassNames };

export type DotEvent = 'critical' | 'informational' | 'success' | 'warning';

export type DotVariant = 'filled';

export type DotProps = React.PropsWithChildren<ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: boolean,
  
  /** Type of Dot to be returned, for now only filled is supported. */
  variant?: undefined | DotVariant,
  
  /** The color of dot to be returned, defaults to success. */
  event: DotEvent,
}>;
export const Dot = ({ event, variant = 'filled', unstyled, ...propsRest }: DotProps) => (
  <div
    {...propsRest}
    className={cx(
      { [cl['bk-dot']]: !unstyled },
      { [cl['bk-dot--filled']]: variant === 'filled' },
      cl[`bk-dot--${event}`],
      propsRest.className,
    )}
  />
);
