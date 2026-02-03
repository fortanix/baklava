/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { mergeProps } from '../../../../util/reactUtil.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  AnchorRenderArgs,
  type ItemKey,
  type ItemDetails,
  type VirtualItemKeys,
  MenuLazyProvider,
  MenuLazyProviderProps,
} from '../../../overlays/MenuLazyProvider/MenuLazyProvider.tsx';
import { useComboBoxState } from '../ComboBoxMulti/ComboBoxMulti.tsx';
import { selectionStateFromItemKey } from '../../../overlays/MenuMultiProvider/MenuMultiProvider.tsx';

import cl from './ComboBoxLazy.module.scss';


export { cl as ComboBoxLazyClassNames };
export type { ItemKey, ItemDetails, VirtualItemKeys };
type InputProps = ComponentProps<typeof InputDefault>;

// COMBO BOX LAZY INPUT
// ---------------------------------------------------------------------------------------------------------------------

type ComboBoxInputProps = Omit<InputProps, 'onSelect'> & {
  anchorRenderArgs: AnchorRenderArgs,
  onUpdate?: undefined | MenuLazyProviderProps['onSelect'],
  Input?: undefined | React.ComponentType<InputProps>,
};
const ComboBoxInput = (props: ComboBoxInputProps) => {
  const {
    anchorRenderArgs,
    onUpdate,
    Input = InputDefault,
    // Hidden input props
    name,
    form,
    ...propsRest
  } = props;

  const {
    props: anchorRenderProps,
    open,
    selectedOption,
  } = anchorRenderArgs;
   
  // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
  const anchorProps = anchorRenderProps({
    placeholder: 'Select options',
    className: cx(cl['bk-combo-box'], { [cl['bk-combo-box--open']]: open }),
  });

  return (
    <>
      <Input
        role="combobox"
        automaticResize
        {...mergeProps(anchorProps, propsRest)}
        inputProps={{
          ...propsRest.inputProps,
          className: cx(cl['bk-combo-box__input'], propsRest.inputProps?.className),
        }}
      />

      {/* Render a hidden input with the selected option key (rather than the human-readable label). */}
      {typeof name === 'string' &&
        <input
          type="hidden"
          form={form}
          name={name}
          value={selectedOption?.itemKey ?? ''}
        />
      }
    </>
  );
};

type DropdownProps = Omit<MenuLazyProviderProps, 'label'>;

// COMBO BOX LAZY
// ---------------------------------------------------------------------------------------------------------------------

/**
 * A `ComboBoxLazy` is a text input control combined with a dropdown menu that lazily
 * loads menu items and adapts to the user input, for example for automatic suggestions.
 * 
 * References: 
 * - [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
 */
export type ComboBoxLazyProps = Omit<InputProps, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the combobox. */
  label: string,

  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<InputProps>,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | null | ItemKey,
  
  /** Callback for when an option is selected in the dropdown menu. */
  onSelect?: undefined | MenuLazyProviderProps['onSelect'],

  /** Additional props to be passed to the `MenuLazyProvider`. */
  dropdownProps: DropdownProps,
};
export const ComboBoxLazy = (props: ComboBoxLazyProps) => {
  const {
    unstyled = false,
    label,
    Input = InputDefault,
    selected,
    onSelect,
    dropdownProps,
    ...propsRest
  } = props;

  const [inputValue, setInputValue] = React.useState(() => {
    return selected
      ? dropdownProps.formatItemLabel?.(selected) ?? ''
      : propsRest.value ?? '';
  });
  
  React.useEffect(
    () => {
      if (typeof propsRest.value === 'undefined' && selected) {
        // Update Input value state on selection change when menu
        // selection is controlled input value is uncontrolled
        setInputValue(dropdownProps.formatItemLabel?.(selected) ?? '');
      }
    },
    [propsRest.value, selected, dropdownProps.formatItemLabel],
  );

  const selectedSet = React.useMemo(() => selectionStateFromItemKey(selected), [selected]);
  const {
    internalSelected,
    handleInternalSelect,
  } = useComboBoxState({
    selected: selectedSet,
    formatItemLabel: dropdownProps.formatItemLabel,
  });

  const internalSelectedItemKey: null | ItemKey = internalSelected.keys().next().value ?? null;

  const handleSelect = React.useCallback((_key: null | ItemKey, itemDetails: null | ItemDetails) => {
    const itemKey = itemDetails?.itemKey ?? null;
    onSelect?.(itemKey, itemDetails);
    setInputValue(itemDetails?.label ?? '');
    handleInternalSelect(itemKey ? new Set([itemKey]) : new Set());
  }, [onSelect, handleInternalSelect]);

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setInputValue(value);
  };

  const handleInputFocusOut = (evt: React.FocusEvent<HTMLInputElement>) => {
    const value = evt.target.value;

    if (value === '') {
      handleSelect(null, null);
    } else {
      setInputValue(internalSelected.values().next().value?.label ?? '');
    }
  };
  
  return (
    <MenuLazyProvider
      label={label}
      role="combobox"
      triggerAction="focus-interactive" // Keep the dropdown menu open while the input is focused
      keyboardInteractions="default" // FIXME
      placement="bottom-start"
      offset={1}
      selected={internalSelectedItemKey}
      onSelect={handleSelect}
      {...dropdownProps}
    >
      {anchorRenderArgs => (
        <ComboBoxInput
          anchorRenderArgs={anchorRenderArgs}
          Input={Input}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputFocusOut}
          {...propsRest}
        />
      )} 
    </MenuLazyProvider>
  );
};
