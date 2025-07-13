/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import cx from 'classnames';
import * as React from 'react';

// Component
import { SpriteIcon as Icon } from '../../icons/Icon';

import './ColorPicker.scss';

export type ColorPickerItemProps = Omit<JSX.IntrinsicElements['div'], 'className' | 'onChange'> & {
  value: string,
  checked?: boolean,
  className?: string,
  tabIndex?: number,
  onColorChange?: (evt: React.ChangeEvent<HTMLInputElement>) => void,
  onClick?: () => void,
};
const ColorPickerItem = (props: ColorPickerItemProps): React.ReactElement => {
  const {
    id,
    value,
    checked = false,
    onColorChange = () => {},
    onClick = () => {},
    tabIndex,
    ...restProps
  } = props;

  return (
    <div
      className="bkl-color-picker__wrapper"
      {...restProps}
    >
      <input
        className="bkl-color-picker__item"
        id={id}
        name={`radio-${value}`} // should be unique for focus
        type="radio"
        value={value}
        checked={checked}
        onChange={onColorChange}
        onClick={onClick}
        tabIndex={tabIndex}
      />
      <label htmlFor={id}>
        <span className={id} />
      </label>
    </div>
  );
};

ColorPickerItem.displayName = 'ColorPicker';

export type ColorPickerGroupProps = Omit<JSX.IntrinsicElements['div'], 'className' | 'onChange'> & {
  colorPreset: Record<string, string>,
  selectedColor: string,
  onChange: (color: string) => void,
  className?: string,
};
const ColorPickerGroup = (props: ColorPickerGroupProps): React.ReactElement => {
  const {
    colorPreset,
    className = '',
    selectedColor,
    onChange,
    ...restProps
  } = props;

  const customPickerRef = React.useRef(null);
  const [customColorPickerValue, setCustomColorPickerValue] = React.useState<string>('');

  React.useEffect(() => {
    // Check if the selected color is present in the default preset or part of multi color picker.
    if (!Object.entries(colorPreset).find(([_key, color]) => color === selectedColor)) {
      setCustomColorPickerValue(selectedColor);
      document.documentElement.style.setProperty('--selected-color-picker', selectedColor);
    }
  }, [selectedColor]);

  const showMultiColorPicker = () => {
    try {
      customPickerRef?.current?.showPicker();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      {...restProps}
      aria-label="Color Picker"
      className={cx('bkl-color-picker-group--inline', className)}
    >
      {Object.entries(colorPreset).map(([key, color]) => (
        <ColorPickerItem
          key={key}
          id={key}
          value={color}
          onColorChange={event => {
            const target = event.target;
            const checked = target.checked;
            const targetValue = target.value;
            if (checked) {
              onChange(targetValue);
            }
            setCustomColorPickerValue('');
          }}
          checked={selectedColor === color && customColorPickerValue === ''}
        />
      ))}

      <div className="bkl-custom-color-picker__wrapper">
        <input
          type="color"
          ref={customPickerRef}
          id="custom-picker"
          data-label="color-picker"
          className="bkl-custom-color-picker__item"
          onChange={event => {
            const targetVal = event.target.value;
            onChange(targetVal);
            setCustomColorPickerValue(targetVal);
            document.documentElement.style.setProperty('--selected-color-picker', targetVal);
          }}
        />

        {!customColorPickerValue ?
          <Icon
            name="color-picker"
            className="bkl-custom-color-picker___icon"
            onClick={showMultiColorPicker}
            icon={import(`../../../assets/icons/color-picker.svg?sprite`)}
          />
          : (
            <ColorPickerItem
              id="bkl-custom-color"
              value={customColorPickerValue}
              onClick={showMultiColorPicker}
              checked={true}
              tabIndex={-1}
            />
          )
        }
      </div>
    </div>
  );
};

ColorPickerGroup.displayName = 'ColorPickerGroup';

type ColorPickerProps = {
  Item: React.FC<ColorPickerItemProps>,
  Group: React.FC<ColorPickerGroupProps>,
};

export const ColorPicker: ColorPickerProps = {
  Item: ColorPickerItem,
  Group: ColorPickerGroup,
};

export default ColorPicker;
