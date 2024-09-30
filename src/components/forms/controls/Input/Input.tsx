/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../../graphics/Icon/Icon.tsx';

import cl from './Input.module.scss';


export { cl as InputClassNames };

export type InputProps = Omit<ComponentProps<'input'>, 'type'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The type of the input. */
  type?: undefined | Exclude<ComponentProps<'input'>['type'], 'button' | 'submit' | 'reset'>,
};
/**
 * Input control.
 */
export const Input = ({ unstyled = false, type = 'text', ...propsRest }: InputProps) => {
  // Prevent inputs from being used as (form submit) buttons
  if (type === 'button' || type === 'submit' || type === 'image' || type === 'reset') {
    throw new Error(`Input: unsupported type '${type}'.`);
  }
  
  return (
    <div>
      <input
        {...propsRest}
        type={type}
        className={cx({
          bk: true,
          [cl['bk-input']]: !unstyled,
        }, propsRest.className)}
      />
      <Icon icon="caret-down"/>
    </div>
  );
};
