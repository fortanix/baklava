/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './Textarea.module.scss';


export { cl as TextareaClassNames };

export type TextareaProps = Omit<ComponentProps<'textarea'>, 'type'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** 
   * Whether the textarea should resize automatically, with `field-sizing: content`.
   * Note that browser support is still somewhat limited:
   * https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
   */
  automaticResize?: undefined | boolean,
  
  invalid?: undefined | boolean,
};

/**
 * Textarea control.
 */
export const Textarea = ({
  unstyled = false,
  automaticResize = false,
  invalid = false,
  ...propsRest
}: TextareaProps) => {
  return (
    <textarea
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-textarea']]: !unstyled,
        [cl['bk-textarea--automatic-resize']]: automaticResize,
        [cl['bk-textarea--invalid']]: invalid,
      }, propsRest.className)}
    />
  );
};
