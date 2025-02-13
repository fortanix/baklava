/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Checkbox } from '../Checkbox/Checkbox.tsx';
import cl from './Switch.module.scss';


export { cl as SwitchClassNames };

export type SwitchProps = ComponentProps<'input'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /**
   * Whether the button is in "nonactive" state. This is a variant of `disabled`, but instead of completely graying
   * out the button, it only becomes a muted variation of the button's appearance. When true, also implies `disabled`.
   */
  nonactive?: undefined | boolean,
};
/**
 * Switch control.
 */
export const Switch = (props: SwitchProps) => {
  const {
    unstyled = false,
    nonactive = false,
    ...propsRest
  } = props;
  
  const isInteractive = !propsRest.disabled && !nonactive;
  
  return (
    <Checkbox
      //switch // https://webkit.org/blog/15054/an-html-switch-control
      unstyled
      {...propsRest}
      disabled={!isInteractive}
      className={cx(
        { [cl['bk-switch']]: !unstyled },
        { [cl['bk-switch--nonactive']]: nonactive },
        propsRest.className,
      )}
    />
  );
};
