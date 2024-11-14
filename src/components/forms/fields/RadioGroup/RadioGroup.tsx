/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './RadioGroup.module.scss';

import { RadioField } from '../RadioField/RadioField.tsx';


export { cl as RadioGroupClassNames };

export type RadioGroupProps = React.PropsWithChildren<{
  direction?: undefined | "vertical" | "horizontal",
}>;

/**
 * Radio group component, wrapping multiple RadioField components vertically or horizontally.
 */
export const RadioGroup = Object.assign(
  (props: RadioGroupProps) => {
    const { children, direction = 'vertical' } = props;
    return (
      <div className={cx(
        'bk',
        cl['bk-radio-group'],
        { [cl['bk-radio-group--horizontal']]: direction === 'horizontal' },
        { [cl['bk-radio-group--vertical']]: direction === 'vertical' },
      )}>
        {children}
      </div>
    );
  },
  { RadioField },
);
