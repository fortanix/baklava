/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { FieldSet } from '../../common/FieldSet/FieldSet.tsx';
import { Radio } from '../Radio/Radio.tsx';

import cl from './RadioGroup.module.scss';


/*
References:
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role
*/

export { cl as RadioGroupClassNames };


export type RadioKey = string;

export type RadioGroupContext = {
  name?: undefined | RadioKey,
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


export type RadioGroupButtonProps = Omit<React.ComponentProps<typeof Radio.Labeled>, 'checked'> & {
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
      // of the descendant `<input>` elements. See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset
      form={context.formId}
      name={context.name}
      value={radioKey}
      onChange={typeof checked === 'undefined' ? undefined : onChange}
      {...propsRest}
      checked={checked} // Do not allow this to be overridden
    />
  );
};

export type RadioGroupProps = ComponentProps<typeof FieldSet> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The machine-readable name of the radio group, used for form data. */
  name?: undefined | string,
  
  /** The human-readable label for the radio group. */
  label?: undefined | React.ReactNode,
  
  /** The orientation of the label relative to the radio group. */
  labelOrientation?: ComponentProps<typeof FieldSet>['orientation'],
  
  /** The default button to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | RadioKey,
  
  /** The radio button to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | RadioKey,
  
  /** Event handler which is called when the selected radio button changes. */
  onUpdate?: undefined | ((radioKey: RadioKey) => void),
  
  /** The orientation of the radio buttons, either horizontal or vertical. Default: `"horizontal"`. */
  orientation?: undefined | 'horizontal' | 'vertical',
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
      labelOrientation,
      defaultSelected,
      selected,
      onUpdate,
      orientation = 'horizontal',
      ...propsRest
    } = props;
    
    const [selectedButton, setSelectedButton] = React.useState<undefined | RadioKey>(selected ?? defaultSelected);
    
    React.useEffect(() => {
      if (typeof selected !== 'undefined') {
        setSelectedButton(selected);
      }
    }, [selected]);
    
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
        <FieldSet
          legend={label}
          orientation={labelOrientation}
          role="radiogroup"
          aria-orientation={orientation}
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-radio-group']]: !unstyled },
            { [cl['bk-radio-group--horizontal']]: orientation === 'horizontal' },
            { [cl['bk-radio-group--vertical']]: orientation === 'vertical' },
            propsRest.className,
          )}
          contentClassName={cl['bk-radio-group__content']}
        >
          {children}
        </FieldSet>
      </RadioGroupContext>
    );
  },
  {
    Button: RadioGroupButton,
  },
);
