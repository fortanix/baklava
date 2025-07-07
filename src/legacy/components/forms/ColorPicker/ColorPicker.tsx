/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import { BaklavaIcon } from '../../icons/icon-pack-baklava/BaklavaIcon.tsx';

import './ColorPicker.scss';


type ColorPickerItemProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  value: string,
  checked?: undefined | boolean,
  onColorChange?: undefined | ((event: React.ChangeEvent<HTMLInputElement>) => void),
};
const ColorPickerItem = (props: ColorPickerItemProps) => {
  const {
    id,
    value,
    checked = false,
    onColorChange = () => {},
    onClick,
    tabIndex,
    ...propsRest
  } = props;
  
  return (
    <div
      {...propsRest}
      className={cx('bkl bkl-color-picker__wrapper', propsRest.className)}
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
        <span id={id} className={id}/>
      </label>
    </div>
  );
};

type ColorPickerGroupProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  colorPreset: Record<string, string>,
  selectedColor: string,
  onChange: (color: string) => void,
};
const ColorPickerGroup = (props: ColorPickerGroupProps) => {
  const {
    colorPreset,
    className,
    selectedColor,
    onChange,
    ...propsRest
  } = props;
  
  const customPickerRef = React.useRef<HTMLInputElement>(null);
  const [customColorPickerValue, setCustomColorPickerValue] = React.useState<string>('');
  
  React.useEffect(() => {
    // Check if the selected color is present in the default preset or part of multi color picker.
    if (!Object.entries(colorPreset).find(([_key, color]) => color === selectedColor)) {
      setCustomColorPickerValue(selectedColor);
      document.documentElement.style.setProperty('--selected-color-picker', selectedColor);
    }
  }, [selectedColor, colorPreset]);
  
  const showMultiColorPicker = () => {
    try {
      customPickerRef.current?.showPicker();
    } catch (error) {
      console.log(error);
    }
  };
  
  return (
    <div
      {...propsRest}
      //aria-label="Color Picker"
      className={cx('bkl bkl-color-picker-group', className)}
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
        
        {!customColorPickerValue
          ? (
            <BaklavaIcon
              icon="color-picker"
              className="bkl-custom-color-picker__icon"
              onClick={showMultiColorPicker}
            />
          )
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

export const ColorPicker = {
  Item: ColorPickerItem,
  Group: ColorPickerGroup,
};
