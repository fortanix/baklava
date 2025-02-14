/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { type ClassNameArgument, classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Button } from '../../../actions/Button/Button.tsx';

import cl from './SegmentedControl.module.scss';
import { useEffectOnce } from '../../../../util/reactUtil.ts';


/*
References:
- https://primer.style/components/segmented-control
- https://canvas.workday.com/components/buttons/segmented-control
- https://github.com/adobe/react-spectrum/discussions/7274
*/

export { cl as SegmentedControlClassNames };


export type ButtonKey = string;

export type SegmentedControlContext = {
  register: (buttonKey: ButtonKey) => () => void,
  selectedButton: ButtonKey,
  disabled: boolean,
  selectButton: (buttonKey: ButtonKey) => void,
};
export const SegmentedControlContext = React.createContext<null | SegmentedControlContext>(null);
export const useSegmentedControlContext = (buttonKey: ButtonKey) => {
  const context = React.use(SegmentedControlContext);
  if (context === null) { throw new Error(`Missing SegmentedControlContext provider`); }
  
  React.useEffect(() => {
    return context.register(buttonKey);
  }, [context.register, buttonKey]);
  
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
  
  const context = useSegmentedControlContext(buttonKey);
  
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
        onPress={() => {
          propsRest.onPress?.();
          context.selectButton(buttonKey);
        }}
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
  
  /** The default button to select. */
  defaultButtonKey: ButtonKey,
  
  /** Whether segmented control is disabled or not. */
  disabled?: undefined | boolean,
  
  /** Event handler for segmented control button change events. */
  onChange?: undefined | ((buttonKey: ButtonKey) => void),
};
/**
 * A segmented control is a set of mutually exclusive buttons that can be switched between.
 */
export const SegmentedControl = Object.assign(
  (props: SegmentedControlProps) => {
    const {
      children,
      unstyled = false,
      //options = [],
      defaultButtonKey,
      disabled = false,
      onChange,
      ...propsRest
    } = props;
    
    /*
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
      if (defaultButtonKey && formattedOptions.some(option => option.value === defaultButtonKey)) {
        return defaultButtonKey;
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
    */
    
    const buttonsRef = React.useRef<Set<ButtonKey>>(new Set());
    const [selectedButton, setSelectedButton] = React.useState(defaultButtonKey);
    
    const selectButton = React.useCallback((buttonKey: ButtonKey) => {
      setSelectedButton(buttonKey);
      onChange?.(buttonKey);
    }, [onChange]);
    
    const register = React.useCallback((buttonKey: ButtonKey) => {
      const buttons = buttonsRef.current;
      if (buttons.has(buttonKey)) {
        console.error(`Duplicate button key: ${buttonKey}`);
      } else {
        buttonsRef.current = new Set([...buttons, buttonKey]);
      }
      
      return () => {
        const buttonsUpdated = new Set(buttons);
        buttonsUpdated.delete(buttonKey);
        buttonsRef.current = buttonsUpdated;
      };
    }, []);
    
    useEffectOnce(() => {
      if (!buttonsRef.current.has(defaultButtonKey)) {
        console.error(`Unable to find a button matching the specified defaultButtonKey: ${defaultButtonKey}`);
      }
    });
    
    const context = React.useMemo<SegmentedControlContext>(() => ({
      register,
      selectedButton,
      selectButton,
      disabled,
    }), [register, selectedButton, selectButton, disabled]);
    
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
          onKeyDown={(event) => {
            console.log('x', buttonsRef.current);
          }}
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
