/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { CheckboxField, type CheckboxFieldProps } from '../CheckboxField/CheckboxField.tsx';

import cl from './CheckboxGroup.module.scss';


export { cl as CheckboxGroupClassNames };

export type CheckboxGroupProps = ComponentProps<'div'> & {
  direction?: undefined | "vertical" | "horizontal";
  items: CheckboxFieldProps[];
  handleChange?: any; // TODO What is the correct type? `(boolean[]) => boolean[]` do not seem to work
};

/**
 * Checkbox component.
 */
export const CheckboxGroup = ({ direction = 'vertical', items, ...props }: CheckboxGroupProps) => {
  const externalHandleChange = props.handleChange;
  const [checked, setChecked] = React.useState<boolean[]>(items.map(i => i.checked || false));

  const internalHandleChange = (e) => {
    setChecked(items.map((i, key) => {
      if (i.value === e.target.value) {
        return !checked[key];
      }
      return !!checked[key];
    }));

    // TODO this doesn't seem to work; checked is returned as the "previous" value of checked, not the value as updated above.
    if (externalHandleChange) {
      externalHandleChange(checked);
    }
  }

  return (
    <div className={cx(
      'bk',
      cl['bk-checkbox-group'],
      { [cl['bk-checkbox-group--horizontal']]: alignment === 'horizontal' },
      { [cl['bk-checkbox-group--vertical']]: alignment === 'vertical' },
    )}>
      {items.map((item, index) => (
        <CheckboxField {...item} checked={checked[index]} key={index} onChange={internalHandleChange} />
      ))}
    </div>
  );
};
