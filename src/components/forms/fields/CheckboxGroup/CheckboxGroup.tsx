/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import cl from './CheckboxGroup.module.scss';

import { CheckboxField } from '../CheckboxField/CheckboxField.tsx';


export { cl as CheckboxGroupClassNames };

export type CheckboxGroupProps = ComponentProps<'div'> & {
  direction?: undefined | 'vertical' | 'horizontal';
};

/**
 * Checkbox group component, wrapping multiple CheckboxField components vertically or horizontally.
 */
export const CheckboxGroup = Object.assign(
  (props: CheckboxGroupProps) => {
    const { children, direction = 'vertical' } = props;
    return (
      <div className={cx(
        'bk',
        cl['bk-checkbox-group'],
        { [cl['bk-checkbox-group--horizontal']]: direction === 'horizontal' },
        { [cl['bk-checkbox-group--vertical']]: direction === 'vertical' },
      )}>
        {children}
      </div>
    );
  },
  { CheckboxField },
);
