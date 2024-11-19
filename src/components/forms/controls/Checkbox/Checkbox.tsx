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

  /** Whether the checkbox is in indeterminate state (minus sign) */
  indeterminate?: undefined | boolean,
};
/**
 * A simple Checkbox control, just the &lt;input type="checkbox"&gt; and nothing else.
 */
export const Checkbox = (props: CheckboxProps) => {
  const {
    unstyled = false,
    indeterminate = false,
    ...propsRest
  } = props;
  
  const checkboxRef = React.useRef<React.ComponentRef<'input'>>(null);
  
  React.useEffect(() => {
    if (checkboxRef?.current) {
      if (indeterminate) {
        checkboxRef.current.checked = false;
      }
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
  return (
    <input
      type="checkbox"
      ref={checkboxRef}
      {...propsRest}
      className={cx(
        'bk',
        { [cl['bk-checkbox']]: !unstyled },
        propsRest.className,
      )}
    />
  );
};
