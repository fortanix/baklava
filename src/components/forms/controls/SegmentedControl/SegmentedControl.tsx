/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Button } from '../../../actions/Button/Button.tsx';

import cl from './SegmentedControl.module.scss';


export { cl as SegmentedControlClassNames };

export type SegmentedOption = {
  label: string,
  value: string,
  className?: string,
};
export type SegmentedControlProps = React.PropsWithChildren<ComponentProps<'ul'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** What options segmented control has */
  options: Array<string> | Array<SegmentedOption>,
  
  /** What default option segmented control has */
  defaultValue: string,
  
  /** Whether segmented control is disabled or not */
  disabled?: undefined | boolean,
  
  /** Event handler for segmented-control button change events. */
  onChange?: undefined | ((option: string) => void),
}>;
/**
 * Set of buttons to switch between various options.
 */
export const SegmentedControl = (props: SegmentedControlProps) => {
  const {
    unstyled = false,
    options = [],
    defaultValue,
    disabled = false,
    onChange,
    ...propsRest
  } = props;
  
  const formattedOptions: SegmentedOption[] = React.useMemo(() => {
    return options.map((option) => {
      if (typeof option !== 'object' || option === null) {
        return {
          label: option,
          value: option,
        };
      }
      return option;
    });
  }, [options]);
  
  const initialOption = () => {
    if (defaultValue && formattedOptions.some(option => option.value === defaultValue)) {
      return defaultValue;
    }
    return formattedOptions[0]?.value;
  };
  const [selectedOption, setSelectedOption] = React.useState(initialOption());
  
  const handleClick = (option: string) => {
    if (!disabled) {
      setSelectedOption(option);
      onChange?.(option);
    }
  };
  
  return (
    <ul
      {...propsRest}
      role="radiogroup"
      className={cx({
        bk: true,
        [cl['bk-segmented-control']]: !unstyled,
        [cl['bk-segmented-control--disabled']]: disabled,
      }, propsRest.className)}
    >
      {formattedOptions.map((option, index) =>
        // biome-ignore lint/suspicious/noArrayIndexKey: no other unique identifier available
        <li key={index} role="presentation" className={cl['bk-segmented-control__item']}>
          <Button
            role="radio"
            unstyled
            className={cx({
              [cl['bk-segmented-control__toggle']]: true,
            }, option.className)}
            aria-label={option.label}
            label={option.label}
            onPress={() => { handleClick(option.value); } }
            aria-checked={selectedOption === option.value ? 'true' : 'false'}
          />
        </li>
      )}
    </ul>
  );
};
