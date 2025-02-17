/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Radio } from '../Radio/Radio.tsx';

import cl from './RadioGroup.module.scss';


/*
References:
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role
*/

export { cl as RadioGroupClassNames };

export type RadioGroupContext = {
  name: string,
};
export const RadioGroupContext = React.createContext<null | RadioGroupContext>(null);
export const useRadioGroupContext = () => {
  const context = React.use(RadioGroupContext);
  if (context === null) { throw new Error(`Missing RadioGroupContext provider`); }
  return context;
};

export const RadioGroupButton = (props: React.ComponentProps<typeof Radio.Labeled>) => {
  const context = useRadioGroupContext();
  return <Radio.Labeled name={context.name} {...props}/>;
};

export type RadioGroupProps = ComponentProps<'fieldset'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The human-readable label for the radio group. */
  label?: undefined | React.ReactNode,
  
  /** The orientation of radio buttons, either vertical or horizontal. Default: 'horizontal'. */
  orientation?: undefined | 'vertical' | 'horizontal',
};

/**
 * A group of mutually exclusive radio buttons. Only one radio can be selected at any given time.
 */
export const RadioGroup = Object.assign(
  (props: RadioGroupProps) => {
    const { unstyled, children, label, orientation = 'horizontal', ...propsRest } = props;
    
    const id = React.useId();
    const context = React.useMemo<RadioGroupContext>(() => ({ name: propsRest.id ?? id }), [propsRest.id, id]);
    
    return (
      <RadioGroupContext value={context}>
        <fieldset
          role="radiogroup"
          aria-orientation={orientation}
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-radio-group']]: !unstyled },
            { [cl['bk-radio-group--horizontal']]: orientation === 'horizontal' },
            { [cl['bk-radio-group--vertical']]: orientation === 'vertical' },
          )}
        >
          <legend>{label}</legend>
          {children}
        </fieldset>
      </RadioGroupContext>
    );
  },
  {
    Button: RadioGroupButton,
  },
);
