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

type RadioKey = string;

export type RadioGroupContext = {
  name: RadioKey,
  formId?: undefined | string,
  selectedButton: undefined | RadioKey,
  selectButton: (radioKey: RadioKey) => void,
};
export const RadioGroupContext = React.createContext<null | RadioGroupContext>(null);
export const useRadioGroupContext = () => {
  const context = React.use(RadioGroupContext);
  if (context === null) { throw new Error(`Missing RadioGroupContext provider`); }
  return context;
};

export type RadioGroupButtonProps = React.ComponentProps<typeof Radio.Labeled> & {
  /** The unique key of this radio button within the radio group. */
  radioKey: RadioKey,
};
export const RadioGroupButton = ({ radioKey, ...propsRest }: RadioGroupButtonProps) => {
  const context = useRadioGroupContext();
  
  const checked: undefined | boolean = typeof context.selectedButton === 'undefined'
    ? undefined // Uncontrolled
    : context.selectedButton === radioKey; // Controlled
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    propsRest.onChange?.(event);
    if (event.target.checked) {
      context.selectButton(radioKey);
    }
  };
  
  return (
    <Radio.Labeled
      // Note: `<fieldset>` also has a `form` attribute, but just setting `form` on  `<fieldset>` does not affect any
      // of the descendent `<input>` elements. See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset
      form={context.formId}
      name={context.name}
      {...propsRest}
      value={radioKey}
      checked={checked}
      onChange={typeof checked === 'undefined' ? undefined : onChange}
    />
  );
};

export type RadioGroupProps = Omit<ComponentProps<'fieldset'>, 'value' | 'defaultChecked' | 'defaultValue'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The machine-readable name of the radio group, used for form data. */
  name: string,
  
  /** The human-readable label for the radio group. */
  label?: undefined | React.ReactNode,
  
  /** The default button to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | RadioKey,
  
  /** The radio button to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | RadioKey,
  
  /** Event handler which is called when the selected radio button changes. */
  onUpdate?: undefined | ((radioKey: RadioKey) => void),
  
  /** The orientation of radio buttons, either vertical or horizontal. Default: 'horizontal'. */
  orientation?: undefined | 'vertical' | 'horizontal',
};

/**
 * A group of mutually exclusive radio buttons. Only one radio can be selected at any given time.
 */
export const RadioGroup = Object.assign(
  (props: RadioGroupProps) => {
    const {
      unstyled,
      children,
      form,
      name,
      label,
      defaultSelected,
      selected,
      onUpdate,
      orientation = 'horizontal',
      ...propsRest
    } = props;
    
    const [selectedButton, setSelectedButton] = React.useState<undefined | RadioKey>(selected ?? defaultSelected);
    
    const selectButton = React.useCallback((radioKey: RadioKey) => {
      setSelectedButton(selectedButton => {
        if (radioKey !== selectedButton) {
          onUpdate?.(radioKey);
          return radioKey;
        } else {
          return selectedButton;
        }
      });
    }, [onUpdate]);
    
    const context = React.useMemo<RadioGroupContext>(() => ({
      name,
      formId: form,
      selectedButton,
      selectButton,
    }), [name, form, selectedButton, selectButton]);
    
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
