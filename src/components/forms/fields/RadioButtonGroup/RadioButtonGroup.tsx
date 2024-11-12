/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './RadioButtonGroup.module.scss';

import { RadioButtonField } from '../RadioButtonField/RadioButtonField.tsx';


export { cl as RadioButtonGroupClassNames };

export type RadioButtonGroupProps = React.PropsWithChildren<{
  direction?: undefined | "vertical" | "horizontal";
}>;

/**
 * Radio button group component, wrapping multiple RadioButtonField components vertically or horizontally.
 */
export const RadioButtonGroup = Object.assign(
  (props: RadioButtonGroupProps) => {
    const { children, direction = 'vertical' } = props;
    return (
      <div className={cx(
        'bk',
        cl['bk-radio-button-group'],
        { [cl['bk-radio-button-group--horizontal']]: direction === 'horizontal' },
        { [cl['bk-radio-button-group--vertical']]: direction === 'vertical' },
      )}>
        {children}
      </div>
    );
  },
  { RadioButtonField },
);
