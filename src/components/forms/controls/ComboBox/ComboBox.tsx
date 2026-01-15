/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { mergeProps } from '../../../../util/reactUtil.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  type ItemDetails,
  MenuProvider,
} from '../../../overlays/MenuProvider/MenuProvider.tsx';

import cl from './ComboBox.module.scss';


export { cl as ComboBoxClassNames };
export type { ItemKey, ItemDetails };
export type ComboBoxInputProps = ComponentProps<typeof InputDefault>;

type UseComboBoxMenuSelectHandlerProps = {
  value?: undefined | Set<string>,
};
export const useComboBoxMenuSelectHandler = (props: UseComboBoxMenuSelectHandlerProps) => {
  const { value } = props;

  const isControlled = typeof value !== 'undefined';
  const [internalInputValue, setInternalInputValue] = React.useState<Set<string>>(new Set());

  const handleInternalInputChange = (values: Set<string>) => {
    setInternalInputValue(values);
  };

  return {
    internalInputValue,
    handleInternalInputChange,
    isControlled,
  }
};

/*
A `ComboBox` is a text input control combined with a dropdown menu that adapts to the user input, for example for
automatic suggestions.

References:
- [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
*/

export type ComboBoxProps = Omit<ComboBoxInputProps, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the combobox. */
  label: string,
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<ComboBoxInputProps>,
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ReactNode,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | null | ItemKey,
  
  /** Callback for when an option is selected in the dropdown menu. */
  onSelect?: undefined | React.ComponentProps<typeof MenuProvider>['onSelect'],
  
  /** Additional props to be passed to the `MenuProvider`. */
  dropdownProps?: undefined | Partial<React.ComponentProps<typeof MenuProvider>>,
};
export const ComboBox = Object.assign(
  (props: ComboBoxProps) => {
    const {
      unstyled = false,
      label,
      Input = InputDefault,
      options,
      selected,
      onSelect,
      dropdownProps = {},
      // Hidden input props
      name,
      form,
      ...propsRest
    } = props;

    const valueSet = React.useMemo(
      () => (typeof propsRest.value === 'string' ? new Set([propsRest.value]) : undefined),
      [propsRest.value],
    );

    const {
      internalInputValue,
      handleInternalInputChange,
      isControlled,
    } = useComboBoxMenuSelectHandler({ value: valueSet });

    const handeSelect = (itemKey: null | ItemKey, itemDetails: null | ItemDetails) => {
      onSelect?.(itemKey, itemDetails);

      if (!isControlled) {
        handleInternalInputChange(new Set([itemDetails?.label ?? '']));
      }
    };

    const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
      propsRest.onChange?.(evt);
      
      if (!isControlled) {
        handleInternalInputChange(new Set([evt.target.value ?? '']));
      }
    };
 
    const inputValueFromInternalInputValue = React.useMemo(() => {
      return internalInputValue.keys().next().value ?? '';
    }, [internalInputValue]);
   
    return (
      <MenuProvider
        label={label}
        items={options}
        role="combobox"
        triggerAction="focus-interactive" // Keep the dropdown menu open while the input is focused
        keyboardInteractions="default" // FIXME
        placement="bottom-start"
        offset={1}
        selected={selected}
        onSelect={handeSelect}
        {...dropdownProps}
      >
        {({ props, open, requestOpen, selectedOption }) => {
          // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
          const anchorProps = props({
            placeholder: 'Select an option',
            className: cx(cl['bk-combo-box'], { [cl['bk-combo-box--open']]: open }),
            //value: selectedOption === null ? '' : selectedOption.label,
            //onChange: () => {},
          });
          
          return (
            <>
              <Input
                role="combobox"
                automaticResize
                value={inputValueFromInternalInputValue}
                onChange={handleChange}
                {...mergeProps(
                  anchorProps,
                  propsRest,
                )}
                inputProps={{
                  ...propsRest.inputProps,
                  className: cx(cl['bk-combo-box__input'], propsRest.inputProps?.className),
                }}
              />
              {/* Render a hidden input with the selected option key (rather than the human-readable label). */}
              {typeof name === 'string' &&
                <input type="hidden" form={form} name={name} value={selectedOption?.itemKey ?? ''}/>
              }
            </>
          );
        }}
      </MenuProvider>
    );
  },
  {
    Static: MenuProvider.Static,
    Option: MenuProvider.Option,
    Header: MenuProvider.Header,
    Action: MenuProvider.Action,
    FooterActions: MenuProvider.FooterActions,
  },
);
