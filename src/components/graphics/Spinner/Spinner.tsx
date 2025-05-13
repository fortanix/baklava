/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { icons } from '../../../assets/icons/_icons.ts';
import cl from './Spinner.module.scss';


export type SpinnerName = keyof typeof icons;
export { cl as SpinnerClassNames };

export type SpinnerProps = React.PropsWithChildren<ComponentProps<'span'> & {
  /**
   * If the spinner should be inline. Optional parameter. Defaults to false.
   */
  inline?: undefined | boolean,
  /**
   * The size of spinner. Optional parameter. Can be "small", "medium" or "large". Defaults to "small".
   */
  size?: undefined | 'large' | 'medium' | 'small',
}>;
export const Spinner = ({
  inline,
  size = 'small',
  ...props
}: SpinnerProps) => {
  return (
    <span
      {...props}
      className={cx({
        bk: true,
        [cl['bk-spinner']]: true,
        [cl[`bk-spinner--${size}`]]: true,
        [cl['bk-spinner--inline']]: inline,
      }, props.className)}
    />
  );
};
