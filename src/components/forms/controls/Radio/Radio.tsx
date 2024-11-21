/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Radio.module.scss';


export { cl as RadioClassNames };

export type RadioProps = ComponentProps<'input'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
/**
 * A simple Radio control, just the &lt;input type="radio"&gt; and nothing else.
 */
export const Radio = (props: RadioProps) => {
  const {
    unstyled = false,
    ...propsRest
  } = props;
  
  return (
    <input
      type="radio"
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-radio']]: !unstyled },
        propsRest.className,
      )}
    />
  );
};
