/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './RadioGroup.module.scss';

import { RadioField } from '../RadioField/RadioField.tsx';


export { cl as RadioGroupClassNames };

export type RadioGroupProps = React.PropsWithChildren<{
  /** Direction of the radio elements, defaults as vertical. */
  direction?: undefined | "vertical" | "horizontal",

  /** Legend for the group of radio buttons. */
  legend?: undefined | React.ReactNode,

  /** Props for the `<legend>` element, if `legend` is defined. */
  legendProps?: undefined | ComponentProps<'legend'>,
}>;

/**
 * Radio group component, wrapping multiple RadioField components vertically or horizontally.
 */
export const RadioGroup = Object.assign(
  (props: RadioGroupProps) => {
    const { children, legend, direction = 'vertical', legendProps = {} } = props;
    return (
      <div className={cx('bk', cl['bk-radio-group'])}>
        {legend &&
          <legend
            {...legendProps}
            className={cx(cl['bk-radio-group__legend'], legendProps.className)}
          >
            {legend}
          </legend>
        }
        <div className={cx(
          cl['bk-radio-group__control'],
          { [cl['bk-radio-group__control--horizontal']]: direction === 'horizontal' },
          { [cl['bk-radio-group__control--vertical']]: direction === 'vertical' },
        )}>
          {children}
        </div>
      </div>
    );
  },
  { RadioField },
);
