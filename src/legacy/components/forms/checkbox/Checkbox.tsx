/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, ComponentPropsWithoutRef, ClassNameArgument } from '../../../util/component_util';
import * as React from 'react';

import './Checkbox.scss';


export type CheckboxItemProps = Omit<ComponentPropsWithoutRef<'label'>, 'onChange'> & {
  label?: React.ReactNode,
  value?: string,
  checked?: boolean,
  disabled?: boolean,
  primary?: boolean,
  tabIndex?: number,
  onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void,
  onkeyDown?: (evt: React.ChangeEvent<HTMLInputElement>) => void,
};
const CheckboxItem = React.forwardRef<HTMLInputElement, CheckboxItemProps>((props, ref) => {
  const {
    label,
    value,
    checked = false,
    className = '',
    disabled = false,
    primary = false,
    onChange = () => {},
    id,
    children,
    onkeyDown,
    tabIndex,
    ...propsRest
  } = props;
  
  return (
    <label
      htmlFor={id}
      className={cx('bkl-checkbox', className, {
        'bkl-checkbox--primary': primary,
        'bkl-checkbox--disabled': disabled,
        'bkl-checkbox--checked': checked,
      })}
      {...propsRest}
    >
      <div className="bkl-checkbox__wrapper">
        <input
          ref={ref}
          id={id}
          tabIndex={tabIndex}
          type="checkbox"
          className="bkl-checkbox__input"
          value={value}
          checked={checked}
          disabled={disabled}
          onChange={evt => {
            // onChange(evt.target.checked);
            onChange(evt); // FIXME
          }}
          onKeyDown={onkeyDown}
        />
        {children ?? label ?? value}
      </div>
    </label>
  );
});
CheckboxItem.displayName = 'Checkbox';

export type CheckboxOption = {
  label: React.ReactNode,
  disabled?: boolean,
};

export type CheckboxGroupProps = ComponentPropsWithoutRef<'div'> & {
  selectedValues?: string[],
  onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void,
  options?: { [key: string]: CheckboxOption },
  children?: React.ReactElement[],
  primary?: boolean,
  inline?: boolean,
};

const CheckboxGroup = (props: CheckboxGroupProps): React.ReactElement => {
  const {
    options = {},
    selectedValues = [],
    className = '',
    onChange = () => {},
    primary = false,
    inline = false,
    children,
    ...propsRest
  } = props;
  
  const renderChildren = (checkboxGroupChildren: React.ReactElement[]): React.ReactNode => {
    return React.Children.map(checkboxGroupChildren, (child: React.ReactElement) => {
      const {
        onChange: childOnChange,
        checked: childChecked,
        value: childValue,
      } = child.props;

      return child.type !== CheckboxItem
        ? child
        : React.cloneElement(child, {
          onChange: childOnChange || onChange,
          checked: childChecked || selectedValues.includes(childValue),
        });
    });
  };
  
  return (
    <div
      {...propsRest}
      className={cx('bkl-checkbox-group', className, {
        'bkl-checkbox-group--primary': primary,
        'bkl-checkbox-group--inline': inline,
      })}
    >
      {children
        ? renderChildren(children)
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
CheckboxGroup.displayName = 'CheckboxGroup';

export const Checkbox = {
  Item: CheckboxItem,
  Group: CheckboxGroup,
};

export default Checkbox;
