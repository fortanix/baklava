/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeCallbacks } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Label } from '../../common/Label/Label.tsx';

import cl from './Checkbox.module.scss';


export { cl as CheckboxClassNames };

export type CheckboxState = boolean;

export type CheckboxProps = Omit<ComponentProps<'input'>, 'defaultChecked' | 'checked'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The default state of the checkbox at initialization time. Default: undefined. */
  defaultChecked?: undefined | CheckboxState,
  
  /** The current state of the checkbox. If `undefined`, the component is considered uncontrolled. */
  checked?: undefined | CheckboxState,
  
  /** Callback for update events, will be called with the new state of the checkbox. */
  onUpdate?: undefined | ((checked: CheckboxState) => void),
};

export type CheckboxLabeledProps = CheckboxProps & {
  label: React.ComponentProps<typeof Label>['label'],
  labelProps?: undefined | Partial<React.ComponentProps<typeof Label>>,
};
export const CheckboxLabeled = ({ label, labelProps = {}, ...props }: CheckboxLabeledProps) => {
  const isDisabled = props.disabled;
  return (
    <Label position="inline-end" label={label} {...labelProps}
      className={cx(
        cl['bk-checkbox-labeled'],
        { [cl['bk-checkbox-labeled--disabled']]: isDisabled },
        labelProps.className,
      )}
    >
      <Checkbox {...props}/>
    </Label>
  );
};

/**
 * A checkbox control is a basic on/off toggle.
 */
export const Checkbox = Object.assign(
  (props: CheckboxProps) => {
    const { unstyled = false, onUpdate, ...propsRest } = props;
    
    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate?.(event.target.checked);
    }, [onUpdate]);
    
    return (
      <input
        type="checkbox"
        {...propsRest}
        className={cx(
          'bk',
          { [cl['bk-checkbox']]: !unstyled },
          propsRest.className,
        )}
        onChange={mergeCallbacks([props.onChange, handleChange])}
      />
    );
  },
  {
    Labeled: CheckboxLabeled,
  },
);
