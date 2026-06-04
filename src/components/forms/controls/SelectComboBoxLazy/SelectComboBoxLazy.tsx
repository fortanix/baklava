/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

// Utils
import { mergeRefs } from '../../../../util/reactUtil.ts';

// Components
import { Input as InputDefault } from '../Input/Input.tsx';
import {
  AnchorRenderArgs,
  type ItemKey,
  type ItemDetails,
  type VirtualItemKeys,
  MenuLazyProvider,
  MenuLazyProviderProps,
} from '../../../overlays/MenuLazyProvider/MenuLazyProvider.tsx';
import { useSelectComboBoxState } from '../SelectComboBoxMulti/SelectComboBoxMulti.tsx';
import { MenuProviderRef, selectionStateFromItemKey } from '../../../overlays/MenuMultiProvider/MenuMultiProvider.tsx';

// Styles
import cl from './SelectComboBoxLazy.module.scss';


export { cl as SelectComboBoxLazyClassNames };
export type { ItemKey, ItemDetails, VirtualItemKeys };
type InputProps = ComponentProps<typeof InputDefault>;

// SELECT COMBO BOX LAZY INPUT
// ---------------------------------------------------------------------------------------------------------------------

type SelectComboBoxInputProps = Omit<InputProps, 'onSelect'> & {
  anchorRenderArgs: AnchorRenderArgs,
  onUpdate?: undefined | MenuLazyProviderProps['onSelect'],
  Input?: undefined | React.ComponentType<InputProps>,
};
const SelectComboBoxInput = (props: SelectComboBoxInputProps) => {
  const {
    ref,
    anchorRenderArgs,
    onUpdate,
    Input = InputDefault,
    automaticResize,
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
   
  const anchorProps = anchorRenderProps({
    ref,
    className: cx(
      cl['bk-combo-box'],
      { [cl['bk-combo-box--open']]: open },
      propsRest.className,
      propsRest.containerProps?.className,
    ),
    onBlur: propsRest.onBlur,
    onKeyDown: propsRest.onKeyDown,
  });

  return (
    <>
      <Input
        role="combobox"
        automaticResize={automaticResize}
        {...propsRest}
        {...anchorProps}
        inputProps={{
          placeholder: 'Select options',
          ...propsRest.inputProps,
          className: cx(cl['bk-combo-box__input'], propsRest.inputProps?.className),
        }}
        containerProps={propsRest.containerProps ?? {}}
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

// SELECT COMBO BOX LAZY
// ---------------------------------------------------------------------------------------------------------------------

/**
 * A `SelectComboBoxLazy` is a text input control combined with a dropdown menu that lazily
 * loads menu items and adapts to the user input, for example for automatic suggestions.
 * 
 * References: 
 * - [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
 */
export type SelectComboBoxLazyProps = Omit<InputProps, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the combobox. */
  label: string,

  /** Render the given item key as a string label. */
  formatItemLabel: ((itemKey: ItemKey) => string),
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<InputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
    
  /** The default option to select. Only relevant for uncontrolled usage (i.e. `selected` is `undefined`). */
  defaultSelected?: undefined | null | ItemKey,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | null | ItemKey,
  
  /** Callback for when an option is selected in the dropdown menu. */
  onSelect?: undefined | MenuLazyProviderProps['onSelect'],

  /** Additional props to be passed to the `MenuLazyProvider`. */
  dropdownProps: Omit<MenuLazyProviderProps, 'label' | 'formatItemLabel'>,
};
export const SelectComboBoxLazy = (props: SelectComboBoxLazyProps) => {
  const {
    ref,
    unstyled = false,
    label,
    value,
    Input = InputDefault,
    selected,
    onSelect,
    onChange,
    onBlur,
    dropdownProps,
    defaultSelected,
    formatItemLabel,
    ...propsRest
  } = props;

  const {
    ref: dropdownPropsRef,
    onBlur: onDropdownBlur,
    ...dropdownPropsRest
  } = dropdownProps;

  const dropdownRef = React.useRef<MenuProviderRef | null>(null);
  const mergedDropdownRef = mergeRefs(dropdownPropsRef, dropdownRef);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const mergedInputRef = mergeRefs(ref, inputRef);
 
  const [inputValue, setInputValue] = React.useState(() => {
    const initialSelected = selected ?? defaultSelected;

    return initialSelected
      ? formatItemLabel?.(initialSelected) ?? ''
      : value ?? '';
  });

  const updateInputValue = React.useCallback((updatedValue: string) => {
    if (typeof value === 'undefined') {
      // Update only when input value is uncontrolled
      setInputValue(updatedValue);
    }
  }, [value]);
  
  React.useEffect(
    () => {
      if (selected) {
        // Update Input value state on selection change when menu
        // selection is controlled and input value is uncontrolled
        updateInputValue(formatItemLabel?.(selected) ?? '');
      }
    },
    [selected, formatItemLabel, updateInputValue],
  );

  const selectedSet = React.useMemo(() => selectionStateFromItemKey(selected), [selected]);
  const defaultSelectedSet = React.useMemo(() => selectionStateFromItemKey(defaultSelected), [defaultSelected]);
  const {
    internalSelected,
    handleInternalSelect,
  } = useSelectComboBoxState({
    selected: typeof selected !== 'undefined' ? selectedSet : defaultSelectedSet,
    formatItemLabel,
  });

  const updateInternalSelected = React.useCallback((updatedInternalSelected: Set<ItemKey>) => {
    if (typeof selected === 'undefined') {
      // Update only when menu selection is uncontrolled
      handleInternalSelect(updatedInternalSelected);
    }
  }, [selected, handleInternalSelect]);

  const internalSelectedItemKey: null | ItemKey = internalSelected.keys().next().value ?? null;

  const handleSelect = React.useCallback((_key: null | ItemKey, itemDetails: null | ItemDetails) => {
    const itemKey = itemDetails?.itemKey ?? null;
    updateInputValue(itemDetails?.label ?? '');
    updateInternalSelected(itemKey ? new Set([itemKey]) : new Set());
    onSelect?.(itemKey, itemDetails);
  }, [onSelect, updateInputValue, updateInternalSelected]);

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = evt.target.value;

    if (typeof selected === 'undefined' && newValue === '') {
      handleSelect(null, null);
    }

    updateInputValue(newValue);
    onChange?.(evt);
  };

  const handleInputFocusOut = (evt: React.FocusEvent<HTMLInputElement>) => {
    const floatingEl = dropdownRef.current?.floatingEl;
    if (floatingEl?.contains(evt.relatedTarget as Node)) { return; }
    updateInputValue(internalSelected.values().next().value?.label ?? '');
    onBlur?.(evt);
  };

  const handleDropdownFocusOut = (evt: React.FocusEvent<HTMLDivElement>) => {
    const inputEl = inputRef.current;
    if (inputEl?.contains(evt.relatedTarget as Node)) { return; }
    const floatingEl = dropdownRef.current?.floatingEl;
    if (floatingEl?.contains(evt.relatedTarget as Node)) { return; }
    updateInputValue(internalSelected.values().next().value?.label ?? '');
    onDropdownBlur?.(evt);
  };
    
  return (
    <MenuLazyProvider
      label={label}
      role="listbox"
      triggerAction="combobox"
      keyboardInteractions="default" // FIXME
      placement="bottom-start"
      offset={1}
      selected={internalSelectedItemKey}
      onSelect={handleSelect}
      onBlur={handleDropdownFocusOut}
      formatItemLabel={formatItemLabel}
      defaultSelected={defaultSelected}
      {...dropdownPropsRest}
      ref={mergedDropdownRef}
    >
      {anchorRenderArgs => (
        <SelectComboBoxInput
          anchorRenderArgs={anchorRenderArgs}
          Input={Input}
          value={typeof value !== 'undefined' ? value : inputValue}
          onChange={handleInputChange}
          onBlur={handleInputFocusOut}
          {...propsRest}
          ref={mergedInputRef}
        />
      )} 
    </MenuLazyProvider>
  );
};
