/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import * as React from 'react';

import { ComponentPropsWithRef } from '../../util/component_util';
import { handleRadioKeyDown } from '../../../util/keyboardHandlers';

import './Radio.scss';

export type RadioItemProps = Omit<ComponentPropsWithRef<'label'>, 'className' | 'onChange'> & {
  radioItemIndex: number,
  label?: React.ReactNode,
  value: string,
  checked?: boolean,
  inline?: boolean,
  disabled?: boolean,
  className?: string,
  withBorder?: boolean,
  switcher?: boolean,
  onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void,
};

const RadioItem = React.forwardRef<HTMLButtonElement, RadioItemProps>((props, ref) => {
  const {
    radioItemIndex,
    label,
    value,
    disabled = false,
    checked = false,
    inline = false,
    onChange = () => {},
    className = '',
    withBorder,
    children,
    switcher,
    id,
    ...restProps
  } = props;
  // TODO: replace with React.useId when react version is updated
  // (don't use crypto.randomUUID() as it causes an error in DSM)
  const uniqueId = Math.floor(10000 + Math.random() * 90000);

  return (
    <label
      htmlFor={id || `radio-${value}-${uniqueId}`}
      className={cx(
        'bkl-radio', className, {
          'bkl-radio--disabled': disabled,
          'bkl-radio--checked': checked,
          'bkl-radio--with-border': withBorder,
          'bkl-radio--with-switcher': switcher,
        },
      )}
      {...restProps}
    >
      <div className="bkl-radio__wrapper">
        <input
          id={id || `radio-${value}-${uniqueId}`}
          name={id || `radio-${value}-${uniqueId}`} // should be unique for focus
          type="radio"
          tabIndex={checked ? 0 : -1}
          value={value}
          className="bkl-radio__input"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          ref={(el) => {
            if (ref) {
              ref.current[radioItemIndex] = el;
            }
          }}
          onKeyDown={(evt: React.KeyboardEvent<HTMLInputElement>) => {
            handleRadioKeyDown({
              evt,
              index: radioItemIndex,
              radioItems: ref?.current,
              direction: inline ? 'horizontal' : 'vertical',
            });
          }}
        />
        {children ?? label ?? value}
      </div>
    </label>
  );
});

RadioItem.displayName = 'Radio';

export type RadioOption = {
  label: React.ReactNode,
  disabled?: boolean,
  className?: string,
};

export type RadioGroupProps = Omit<JSX.IntrinsicElements['div'], 'className'> & {
  children?: React.ReactElement[],
  selectedValue?: string,
  onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void,
  options?: { [key: string]: RadioOption },
  className?: string,
  primary?: boolean,
  radioWithBorder?: boolean,
  inline?: boolean,
  radioSwitcher?: boolean,
};

const RadioGroup = (props: RadioGroupProps): React.ReactElement => {
  const {
    children,
    selectedValue,
    options = {},
    onChange = () => {},
    className = '',
    primary,
    radioWithBorder,
    inline,
    radioSwitcher,
    ...restProps
  } = props;
  const radioItemsRef = React.useRef<HTMLInputElement[]>([]);

  const renderChildren = (radioGroupChildren: React.ReactElement[]): React.ReactNode => {
    return React.Children.map(radioGroupChildren, (child: React.ReactElement, index: number) => {
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
      {...restProps}
      role="radiogroup"
      className={cx(
        'bkl-radio-group', className, {
          'bkl-radio-group--primary': primary,
          'bkl-radio-group--inline': inline,
        },
      )}
    >
      {children
        ? renderChildren(children)
        : Object.entries(options).map(([key, { label, disabled, className }], index) => (
          <RadioItem
            radioItemIndex={index}
            key={key}
            value={key}
            label={label}
            className={className}
            disabled={disabled}
            onChange={onChange}
            checked={selectedValue === key}
            withBorder={radioWithBorder}
            switcher={radioSwitcher}
            ref={radioItemsRef}
            inline={inline}
          />
        ))
      }
    </div>
  );
};

RadioGroup.displayName = 'RadioGroup';

type RadioProps = {
  Item: React.FC<RadioItemProps>,
  Group: React.FC<RadioGroupProps>,
};

export const Radio: RadioProps = {
  Item: RadioItem,
  Group: RadioGroup,
};

export default Radio;
