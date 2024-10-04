/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Checkbox.module.scss';


export { cl as CheckboxClassNames };

export type CheckboxProps = ComponentProps<'input'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
/**
 * Checkbox control.
 */
export const Checkbox = (props: CheckboxProps) => {
  const {
    unstyled = false,
    ...propsRest
  } = props;
  
  return (
    <input
      type="checkbox"
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-checkbox']]: !unstyled },
        propsRest.className,
      )}
    />
  );
};
