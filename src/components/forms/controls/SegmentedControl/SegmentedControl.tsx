/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, useEffectOnce } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Button } from '../../../actions/Button/Button.tsx';

import cl from './SegmentedControl.module.scss';


/*
References:
- https://primer.style/components/segmented-control
- https://canvas.workday.com/components/buttons/segmented-control
- https://github.com/adobe/react-spectrum/discussions/7274
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/radiogroup_role
*/

export { cl as SegmentedControlClassNames };


// Check whether the given element is programmatically focusable. Note that we're not checking `tabindex` here, since
// we want to know whether something is *programmatically* focusable, not necessarily user focusable. Also, we're not
// doing any element type checks here, we asume that the given element is of some interactive type.
const isElementFocusable = (element: HTMLElement): boolean => {
  return element.matches(':not(:disabled, [hidden])');
};


export type ButtonKey = string;
export type ButtonDef = {
  buttonKey: ButtonKey,
  buttonRef: React.RefObject<null | React.ComponentRef<typeof Button>>,
};

export type SegmentedControlContext = {
  register: (buttonDef: ButtonDef) => () => void,
  selectedButton: undefined | ButtonKey,
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
};
const SegmentedControlButton = (props: SegmentedControlButtonProps) => {
  const { unstyled, buttonKey, ...propsRest } = props;
  
  const buttonRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const buttonDef = React.useMemo<ButtonDef>(() => ({ buttonKey, buttonRef }), [buttonKey]);
  
  const context = useSegmentedControlContext(buttonDef);
  const isSelected = context.selectedButton === buttonKey;
  
  return (
    <Button
      unstyled
      role="radio"
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1} // "Roving" tab index
      {...propsRest}
      ref={mergeRefs(buttonRef, propsRest.ref)}
      className={cx(
        { [cl['bk-segmented-control__button']]: !unstyled },
        propsRest.className,
      )}
      onPress={() => {
        propsRest.onPress?.();
        context.selectButton(buttonKey);
      }}
      disabled={context.disabled || propsRest.disabled}
    />
  );
};

export type SegmentedControlProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  // Note: currently only supports `small`, but we may introduce a 'medium' default in the future. Make this field
  // required for now so that we can change the default later.
  /** The size of the component. */
  size: 'small',
  
  /** The default button to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | ButtonKey,
  
  /** The button to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | ButtonKey,
  
  /** Event handler for segmented control button change events. */
  onUpdate?: undefined | ((buttonKey: ButtonKey) => void),
  
  /** Whether segmented control is disabled or not. */
  disabled?: undefined | boolean,
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
};
/**
 * A segmented control is a set of mutually exclusive buttons that can be switched between.
 */
export const SegmentedControl = Object.assign(
  (props: SegmentedControlProps) => {
    const {
      children,
      unstyled = false,
      size = 'small',
      defaultSelected,
      selected,
      disabled = false,
      onUpdate,
      inputProps = {},
      ...propsRest
    } = props;
    
    if (typeof selected !== 'undefined' && !onUpdate) {
      console.warn(`Using SegmentedControl as uncontrolled component, but missing 'onChange' callback.`);
    }
    
    const buttonDefsRef = React.useRef<Map<ButtonKey, ButtonDef>>(new Map());
    const [selectedButton, setSelectedButton] = React.useState<undefined | ButtonKey>(selected ?? defaultSelected);
    
    const selectButton = React.useCallback((buttonKey: ButtonKey) => {
      setSelectedButton(selectedButton => {
        if (buttonKey !== selectedButton) {
          onUpdate?.(buttonKey);
          buttonDefsRef.current.get(buttonKey)?.buttonRef.current?.focus();
          return buttonKey;
        } else {
          return selectedButton;
        }
      });
    }, [onUpdate]);
    
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
    
    // After initial rendering, check whether `defaultSelected` refers to one of the rendered buttons
    useEffectOnce(() => {
      if (typeof defaultSelected === 'undefined') { return; }
      
      const buttonDef: undefined | ButtonDef = buttonDefsRef.current.get(defaultSelected);
      if (typeof buttonDef === 'undefined' || buttonDef.buttonRef.current === null) {
        console.error(`Unable to find a button matching the specified defaultSelected: ${defaultSelected}`);
      } else if (!disabled && !isElementFocusable(buttonDef.buttonRef.current)) {
        console.error(`Default button is not focusable: ${defaultSelected}`);
      }
    });
    
    const context = React.useMemo<SegmentedControlContext>(() => ({
      register,
      selectedButton,
      selectButton,
      disabled,
    }), [register, selectedButton, selectButton, disabled]);
    
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      const selectedButton = context.selectedButton;
      if (typeof selectedButton === 'undefined') { return; }
      
      // Get the list of button keys, ideally in the order that they are displayed to the user.
      // Filter only the buttons that are (programmatically) focusable.
      const buttonKeys: Array<ButtonKey> = [...buttonDefsRef.current.entries()]
        .filter(([_, { buttonRef }]) => buttonRef.current && isElementFocusable(buttonRef.current))
        .map(([buttonKey]) => buttonKey);
      
      const buttonIndex: number = buttonKeys.indexOf(selectedButton);
      if (buttonIndex < 0) {
        console.error(`Could not resolve selected button: '${selectedButton}'`);
      }
      
      // Determine the target button to focus based on the keyboard event (if any)
      const buttonTarget = ((): null | ButtonKey => {
        switch (event.key) {
          case 'ArrowLeft': {
            const buttonPrevIndex = buttonIndex === 0 ? -1 : buttonIndex - 1;
            const buttonPrev: undefined | ButtonKey = buttonKeys.at(buttonPrevIndex);
            if (typeof buttonPrev  === 'undefined') { throw new Error(`Should not happen`); }
            return buttonPrev;
          }
          case 'ArrowRight': {
            const buttonNextIndex = buttonIndex + 1 >= buttonKeys.length ? 0 : buttonIndex + 1;
            const buttonNext: undefined | ButtonKey = buttonKeys.at(buttonNextIndex);
            if (typeof buttonNext  === 'undefined') { throw new Error(`Should not happen`); }
            return buttonNext;
          }
          case 'ArrowUp': {
            const buttonFirst: undefined | ButtonKey = buttonKeys.at(0);
            if (typeof buttonFirst  === 'undefined') { throw new Error(`Should not happen`); }
            return buttonFirst;
          }
          case 'ArrowDown': {
            const buttonLast: undefined | ButtonKey = buttonKeys.at(-1);
            if (typeof buttonLast  === 'undefined') { throw new Error(`Should not happen`); }
            return buttonLast;
          }
          default: return null;
        }
      })();
      
      if (buttonTarget !== null && buttonTarget !== context.selectedButton) {
        event.preventDefault();
        context.selectButton(buttonTarget);
      }
    }, [context]);
    
    return (
      <SegmentedControlContext value={context}>
        <div
          role="radiogroup"
          aria-required
          aria-orientation="horizontal"
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-segmented-control']]: !unstyled },
            { [cl['bk-segmented-control--small']]: size === 'small' },
            { [cl['bk-segmented-control--disabled']]: disabled },
            propsRest.className,
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Hidden input, so that this component can be connected to a <form> element */}
          <input type="hidden" {...inputProps} value={selectedButton} onChange={undefined}/>
          
          {children}
        </div>
      </SegmentedControlContext>
    );
  },
  {
    Button: SegmentedControlButton,
  },
);
