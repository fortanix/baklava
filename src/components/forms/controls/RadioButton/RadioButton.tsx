/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './RadioButton.module.scss';


export { cl as RadioButtonClassNames };

export type RadioButtonProps = ComponentProps<'input'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
/**
 * A simple RadioButton control, just the &lt;input type="radio"&gt; and nothing else..
 */
export const RadioButton = (props: RadioButtonProps) => {
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
        { [cl['bk-radio-button']]: !unstyled },
        propsRest.className,
      )}
    />
  );
};
