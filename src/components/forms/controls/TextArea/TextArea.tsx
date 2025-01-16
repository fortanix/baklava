/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import cl from './TextArea.module.scss';


export { cl as TextAreaClassNames };

export type TextAreaProps = Omit<ComponentProps<'textarea'>, 'type'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** 
   * Whether the textarea should resize automatically, with `field-sizing: content`.
   * Note that browser support is still somewhat limited:
   * https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
   */
  automaticResize?: undefined | boolean,

  /** Whether the component should be styled as invalid, i.e. having invalid content or failed validation. */
  invalid?: undefined | boolean,
};

/**
 * TextArea control.
 */
export const TextArea = ({
  unstyled = false,
  automaticResize = false,
  invalid = false,
  ...propsRest
}: TextAreaProps) => {
  return (
    <textarea
      {...propsRest}
      className={cx({
        bk: true,
        [cl['bk-text-area']]: !unstyled,
        [cl['bk-text-area--automatic-resize']]: automaticResize,
        [cl['bk-text-area--invalid']]: invalid,
      }, propsRest.className)}
    />
  );
};
