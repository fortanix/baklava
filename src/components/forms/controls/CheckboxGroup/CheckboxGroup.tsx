/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps, type ClassNameArgument } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './CheckboxGroup.module.scss';


export { cl as CheckboxGroupClassNames };

export type CheckboxGroupProps = React.PropsWithChildren<{
  alignment?: undefined | "vertical" | "horizontal";
}>;

/**
 * Checkbox component.
 */
export const CheckboxGroup = ({children, alignment = 'vertical'}: CheckboxGroupProps) => (
  <div className={cx(
    'bk',
    cl['bk-checkbox-group'],
    { [cl['bk-checkbox-group--horizontal']]: alignment === 'horizontal' },
    { [cl['bk-checkbox-group--vertical']]: alignment === 'vertical' },
  )}>
    {children}
  </div>
);