/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument, type ComponentProps } from '../../../util/component_util.tsx';

import './Checkbox.scss';


export type CheckboxItemProps = Omit<ComponentProps<'label'>, 'ref' | 'onChange'> & {
  ref?: undefined | React.Ref<HTMLInputElement>,
  
  /** @deprecated */
  primary?: undefined | boolean,
  
  label?: undefined | React.ReactNode,
  value?: undefined | string,
  checked?: undefined | boolean,
  disabled?: undefined | boolean,
  inputClassName?: undefined | ClassNameArgument,
  tabIndex?: undefined | number,
  onChange?: undefined | ((event: React.ChangeEvent<HTMLInputElement>) => void),
  onKeyDown?: undefined | ((event: React.KeyboardEvent<HTMLInputElement>) => void),
};
const CheckboxItem = (props: CheckboxItemProps) => {
  const {
    ref,
    primary,
    label,
    value,
    checked = false,
    className,
    disabled = false,
    inputClassName,
    onChange = () => {},
    id,
    children,
    onKeyDown,
    tabIndex,
    ...propsRest
  } = props;
  
  return (
    <label
      htmlFor={id}
      className={cx(
        'bkl',
        'bkl-checkbox',
        className,
        {
          'bkl-checkbox--primary': true,
          'bkl-checkbox--disabled': disabled,
          'bkl-checkbox--checked': checked,
        },
      )}
      {...propsRest}
    >
      <div className="bkl-checkbox__wrapper">
        <input
          ref={ref}
          id={id}
          tabIndex={tabIndex}
          type="checkbox"
          className={cx('bkl-checkbox__input', inputClassName)}
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={event => {
            // onChange(event.target.checked);
            onChange(event); // FIXME
          }}
          onKeyDown={onKeyDown}
        />
        {children ?? label ?? value}
      </div>
    </label>
  );
};

export type CheckboxOption = {
  label: React.ReactNode,
  disabled?: undefined | boolean,
};

export type CheckboxGroupProps = ComponentProps<'div'> & {
  selectedValues?: undefined | string[],
  onChange?: undefined | ((event: React.ChangeEvent<HTMLInputElement>) => void),
  options?: undefined | { [key: string]: CheckboxOption },
  children?: undefined | Array<React.ReactElement>,
  inline?: undefined | boolean,
};
const CheckboxGroup = (props: CheckboxGroupProps) => {
  const {
    options = {},
    selectedValues = [],
    className = '',
    onChange = () => {},
    inline = false,
    children,
    ...propsRest
  } = props;
  
  const renderChildren = (checkboxGroupChildren: Array<React.ReactElement<CheckboxItemProps>>): React.ReactNode => {
    return React.Children.map(checkboxGroupChildren, (child: React.ReactElement<CheckboxItemProps>) => {
      const {
        onChange: childOnChange,
        checked: childChecked,
        value: childValue,
      } = child.props;
      
      return child.type !== CheckboxItem
        ? child
        : React.cloneElement(child, {
          onChange: childOnChange || onChange,
          checked: childChecked || (typeof childValue === 'string' && selectedValues.includes(childValue)),
        });
    });
  };
  
  return (
    <div
      {...propsRest}
      className={cx(
        'bkl',
        'bkl-checkbox-group',
        className,
        {
          'bkl-checkbox-group--primary': true,
          'bkl-checkbox-group--inline': inline,
        },
      )}
    >
      {children
        ? renderChildren(children as Array<React.ReactElement<CheckboxItemProps>>)
        :
          Object.entries(options).map(([key, { label, disabled }]) =>
            <CheckboxItem
              key={key}
              value={key}
              label={label}
              disabled={disabled}
              onChange={onChange}
              checked={selectedValues.includes(key)}
            />,
          )
      }
    </div>
  );
};

export const Checkbox = {
  Item: CheckboxItem,
  Group: CheckboxGroup,
};
