/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ClassNameArgument, classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Button } from '../../../actions/Button/Button.tsx';

import cl from './SegmentedControl.module.scss';


/*
References:
- https://primer.style/components/segmented-control
- https://canvas.workday.com/components/buttons/segmented-control
- https://github.com/adobe/react-spectrum/discussions/7274
*/

export { cl as SegmentedControlClassNames };


export type ButtonKey = string;
//export type ButtonDef = { buttonKey: ButtonKey, label: string };

export type SegmentedControlContext = {
  selectedButton: ButtonKey,
  disabled: boolean,
  selectButton: (buttonKey: ButtonKey) => void,
  // getItemProps: ReturnType<typeof useInteractions>['getItemProps'],
};
export const SegmentedControlContext = React.createContext<null | SegmentedControlContext>(null);
export const useSegmentedControlContext = () => {
  const context = React.use(SegmentedControlContext);
  if (context === null) { throw new Error(`Missing SegmentedControlContext provider`); }
  return context;
};


type SegmentedControlButtonProps = ComponentProps<typeof Button> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The unique key of this button within the segmented control. */
  buttonKey: ButtonKey,
  
  /** Class name to apply to the inner `<Button/>` element. */
  buttonClassName?: undefined | ClassNameArgument,
};
const SegmentedControlButton = (props: SegmentedControlButtonProps) => {
  const { unstyled, buttonKey, buttonClassName, ...propsRest } = props;
  
  const context = useSegmentedControlContext();
  
  return (
    <li
      role="presentation"
      className={cx(
        { [cl['bk-segmented-control__item']]: !unstyled },
        propsRest.className,
      )}
    >
      <Button
        unstyled
        role="radio"
        {...propsRest}
        className={cx(
          { [cl['bk-segmented-control__button']]: !unstyled },
          buttonClassName,
        )}
        // aria-label={option.label}
        // label={option.label}
        onPress={() => { context.selectButton(buttonKey); } }
        aria-checked={context.selectedButton === buttonKey}
        disabled={context.disabled || propsRest.disabled}
      />
    </li>
  );
};



export type SegmentedOption = {
  label: string,
  value: string,
  className?: undefined | ClassNameArgument,
};

export type SegmentedControlProps = ComponentProps<'ul'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  ///** What options segmented control has. */
  //options: Array<string> | Array<SegmentedOption>,
  
  /** What default option segmented control has. */
  defaultValue: string,
  
  /** Whether segmented control is disabled or not. */
  disabled?: undefined | boolean,
  
  /** Event handler for segmented control button change events. */
  onChange?: undefined | ((option: string) => void),
};
/**
 * A segmented control is a set of mutually exclusive buttons that can be switched between.
 */
export const SegmentedControl = Object.assign(
  (props: SegmentedControlProps) => {
    const {
      children,
      unstyled = false,
      options = [],
      defaultValue,
      disabled = false,
      onChange,
      ...propsRest
    } = props;
    
    const formattedOptions: Array<SegmentedOption> = React.useMemo(() => {
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
    
    const context = React.useMemo<SegmentedControlContext>(() => ({
      selectedButton: 'red', // FIXME
      disabled,
    }), [disabled]);
    
    return (
      <SegmentedControlContext value={context}>
        <ul
          {...propsRest}
          role="radiogroup"
          className={cx(
            'bk',
            { [cl['bk-segmented-control']]: !unstyled },
            { [cl['bk-segmented-control--disabled']]: disabled },
            propsRest.className,
          )}
        >
          {/*formattedOptions.map((option, index) =>
            // biome-ignore lint/suspicious/noArrayIndexKey: no other unique identifier available
            <li key={index} role="presentation" className={cl['bk-segmented-control__item']}>
              <Button
                role="radio"
                unstyled
                className={cx(
                  [cl['bk-segmented-control__toggle']],
                  option.className,
                )}
                aria-label={option.label}
                label={option.label}
                onPress={() => { handleClick(option.value); } }
                aria-checked={selectedOption === option.value ? 'true' : 'false'}
              />
            </li>
          )*/}
          {children}
        </ul>
      </SegmentedControlContext>
    );
  },
  {
    Button: SegmentedControlButton,
  },
);
