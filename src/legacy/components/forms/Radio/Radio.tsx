/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../util/component_util.tsx';

import { handleRadioKeyDown } from '../../../util/keyboardHandlers.tsx';

import './Radio.scss';


export type RadioItemProps = Omit<ComponentProps<'label'>, 'onChange'> & {
  ref?: undefined | React.RefObject<Array<HTMLInputElement>>,
  radioItemIndex: number,
  label?: undefined | React.ReactNode,
  value: string,
  checked?: undefined | boolean,
  inline?: undefined | boolean,
  disabled?: undefined | boolean,
  withBorder?: undefined | boolean,
  switcher?: undefined | boolean,
  onChange?: undefined | ((event: React.ChangeEvent<HTMLInputElement>) => void),
};
const RadioItem = (props: RadioItemProps) => {
  const {
    ref,
    radioItemIndex,
    label,
    value,
    disabled = false,
    checked = false,
    inline = false,
    onChange = () => {},
    withBorder,
    children,
    switcher,
    id,
    ...propsRest
  } = props;
  
  const uniqueId = React.useId();
  
  return (
    <label
      htmlFor={id || `radio-${value}-${uniqueId}`}
      {...propsRest}
      className={cx(
        'bkl',
        'bkl-radio',
        {
          'bkl-radio--disabled': disabled,
          'bkl-radio--checked': checked,
          'bkl-radio--with-border': withBorder,
          'bkl-radio--with-switcher': switcher,
        },
        propsRest.className,
      )}
    >
      <div className="bkl-radio__wrapper">
        <input
          id={id || `radio-${value}-${uniqueId}`}
          name={id || `radio-${value}-${uniqueId}`} // Should be unique for focus
          type="radio"
          tabIndex={checked ? 0 : -1}
          value={value}
          className="bkl-radio__input"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={(el) => {
            if (ref?.current && el) {
              ref.current[radioItemIndex] = el;
            }
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>) => {
            const radioItems = ref?.current;
            if (radioItems) {
              handleRadioKeyDown({
                evt,
                index: radioItemIndex,
                radioItems: ref?.current,
                direction: inline ? 'horizontal' : 'vertical',
              });
            }
          }}
        />
        {children ?? label ?? value}
      </div>
    </label>
  );
};

export type RadioOption = {
  label: React.ReactNode,
  disabled?: undefined | boolean,
  className?: undefined | ClassNameArgument,
};
export type RadioGroupProps = ComponentProps<'div'> & {
  children?: undefined | Array<React.ReactElement>,
  selectedValue?: undefined | string,
  onChange?: undefined | ((event: React.ChangeEvent<HTMLInputElement>) => void),
  options?: undefined | { [key: string]: RadioOption },
  primary?: undefined | boolean,
  radioWithBorder?: undefined | boolean,
  inline?: undefined | boolean,
  radioSwitcher?: undefined | boolean,
};
const RadioGroup = (props: RadioGroupProps) => {
  const {
    children,
    selectedValue,
    options = {},
    onChange = () => {},
    primary,
    radioWithBorder,
    inline,
    radioSwitcher,
    ...propsRest
  } = props;
  const radioItemsRef = React.useRef<Array<HTMLInputElement>>([]);
  
  const renderChildren = (radioGroupChildren: Array<React.ReactElement<RadioItemProps>>): React.ReactNode => {
    return React.Children.map(radioGroupChildren, (child: React.ReactElement<RadioItemProps>, index: number) => {
      const {
        onChange: childOnChange,
        checked: childChecked,
        value: childValue,
      } = child.props;
      
      return child.type !== RadioItem
        ? child
        : React.cloneElement(child, {
          radioItemIndex: index,
          onChange: childOnChange || onChange,
          checked: childChecked || selectedValue === childValue,
          withBorder: radioWithBorder,
          switcher: radioSwitcher,
          ref: radioItemsRef,
          inline,
        });
    });
  };

  return (
    <div
      role="radiogroup"
      {...propsRest}
      className={cx(
        'bkl-radio-group',
        propsRest.className,
        {
          'bkl-radio-group--primary': primary,
          'bkl-radio-group--inline': inline,
        },
      )}
    >
      {children
        ? renderChildren(children)
        : Object.entries(options).map(([key, { label, disabled, className }], index) => (
          <RadioItem
            key={key}
            ref={radioItemsRef}
            radioItemIndex={index}
            value={key}
            label={label}
            className={className}
            disabled={disabled}
            onChange={onChange}
            checked={selectedValue === key}
            withBorder={radioWithBorder}
            switcher={radioSwitcher}
            inline={inline}
          />
        ))
      }
    </div>
  );
};

type RadioProps = {
  Item: React.ComponentType<RadioItemProps>,
  Group: React.ComponentType<RadioGroupProps>,
};

export const Radio: RadioProps = {
  Item: RadioItem,
  Group: RadioGroup,
};
