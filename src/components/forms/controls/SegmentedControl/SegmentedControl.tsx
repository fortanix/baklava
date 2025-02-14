/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, useEffectOnce } from '../../../../util/reactUtil.ts';
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
export type ButtonDef = {
  buttonKey: ButtonKey,
  buttonRef: React.RefObject<null | React.ComponentRef<typeof Button>>,
};

export type SegmentedControlContext = {
  register: (buttonDef: ButtonDef) => () => void,
  selectedButton: ButtonKey,
  disabled: boolean,
  selectButton: (buttonKey: ButtonKey) => void,
};
export const SegmentedControlContext = React.createContext<null | SegmentedControlContext>(null);
export const useSegmentedControlContext = (buttonDef: ButtonDef) => {
  const context = React.use(SegmentedControlContext);
  if (context === null) { throw new Error(`Missing SegmentedControlContext provider`); }
  
  React.useEffect(() => {
    return context.register(buttonDef);
  }, [context.register, buttonDef]);
  
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
  
  const buttonRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const buttonDef = React.useMemo<ButtonDef>(() => ({ buttonKey, buttonRef }), [buttonKey]);
  
  const context = useSegmentedControlContext(buttonDef);
  const isSelected = context.selectedButton === buttonKey;
  
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
        aria-checked={isSelected}
        tabIndex={isSelected ? 0 : -1}
        {...propsRest}
        ref={mergeRefs(buttonRef, propsRest.ref)}
        className={cx(
          { [cl['bk-segmented-control__button']]: !unstyled },
          buttonClassName,
        )}
        onPress={() => {
          propsRest.onPress?.();
          context.selectButton(buttonKey);
        }}
        disabled={context.disabled || propsRest.disabled}
      />
    </li>
  );
};

export type SegmentedControlProps = ComponentProps<'ul'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
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
      defaultButtonKey,
      disabled = false,
      onChange,
      ...propsRest
    } = props;
    
    const buttonDefsRef = React.useRef<Map<ButtonKey, ButtonDef>>(new Map());
    const [selectedButton, setSelectedButton] = React.useState(defaultButtonKey);
    
    const selectButton = React.useCallback((buttonKey: ButtonKey) => {
      setSelectedButton(selectedButton => {
        if (buttonKey !== selectedButton) {
          onChange?.(buttonKey);
          buttonDefsRef.current.get(buttonKey)?.buttonRef.current?.focus();
          return buttonKey;
        } else {
          return selectedButton;
        }
      });
    }, [onChange]);
    
    const register = React.useCallback((buttonDef: ButtonDef) => {
      const buttonDefs = buttonDefsRef.current;
      if (buttonDefs.has(buttonDef.buttonKey)) {
        console.error(`Duplicate button key: ${buttonDef.buttonKey}`);
      } else {
        buttonDefsRef.current.set(buttonDef.buttonKey, buttonDef);
      }
      
      return () => {
        buttonDefsRef.current.delete(buttonDef.buttonKey);
      };
    }, []);
    
    // After initial rendering, check whether `defaultButtonKey` refers to one of the rendered buttons
    useEffectOnce(() => {
      if (!buttonDefsRef.current.has(defaultButtonKey)) {
        console.error(`Unable to find a button matching the specified defaultButtonKey: ${defaultButtonKey}`);
      }
    });
    
    const context = React.useMemo<SegmentedControlContext>(() => ({
      register,
      selectedButton,
      selectButton,
      disabled,
    }), [register, selectedButton, selectButton, disabled]);
    
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      const buttonKeys: Array<ButtonKey> = [...buttonDefsRef.current.entries()]
        .filter(([_, { buttonRef }]) => {
          // Filter only the buttons that are focusable
          const buttonEl = buttonRef.current;
          if (!buttonEl) { return false; }
          return buttonEl.matches(':not(:disabled, [hidden])');
        })
        .map(([buttonKey]) => buttonKey);
      
      const buttonIndex: number = buttonKeys.indexOf(context.selectedButton);
      if (buttonIndex < 0) {
        console.error(`Could not resolve selected button ${context.selectedButton}`);
      }
      
      // Determine the target button to focus based on the keyboard event
      let buttonTarget: undefined | ButtonKey = undefined;
      if (event.key === 'ArrowLeft') {
        const buttonBeforeIndex = Math.max(0, buttonIndex - 1);
        const buttonBefore: undefined | ButtonKey = buttonKeys.at(buttonBeforeIndex);
        if (typeof buttonBefore  === 'undefined') { throw new Error(`Should not happen`); }
        buttonTarget = buttonBefore;
      } else if (event.key === 'ArrowRight') {
        const buttonAfterIndex = Math.min(buttonKeys.length - 1, buttonIndex + 1);
        const buttonAfter: undefined | ButtonKey = buttonKeys.at(buttonAfterIndex);
        if (typeof buttonAfter  === 'undefined') { throw new Error(`Should not happen`); }
        buttonTarget = buttonAfter;
      }
      
      if (buttonTarget && buttonTarget !== context.selectedButton) {
        context.selectButton(buttonTarget);
      }
    }, [context]);
    
    return (
      <SegmentedControlContext value={context}>
        <ul
          {...propsRest}
          role="radiogroup"
          aria-required
          className={cx(
            'bk',
            { [cl['bk-segmented-control']]: !unstyled },
            { [cl['bk-segmented-control--disabled']]: disabled },
            propsRest.className,
          )}
          onKeyDown={handleKeyDown}
        >
          {children}
        </ul>
      </SegmentedControlContext>
    );
  },
  {
    Button: SegmentedControlButton,
  },
);
