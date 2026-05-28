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
import { useComboBoxState } from '../ComboBoxMulti/ComboBoxMulti.tsx';
import { MenuProviderRef, selectionStateFromItemKey } from '../../../overlays/MenuMultiProvider/MenuMultiProvider.tsx';

// Styles
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
    ref,
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
   
  const anchorProps = anchorRenderProps({
    ref,
    className: cx(
      cl['bk-combo-box'],
      { [cl['bk-combo-box--open']]: open },
      propsRest.containerProps?.className,
    ),
    onBlur: propsRest.onBlur,
  });

  return (
    <>
      <Input
        role="combobox"
        automaticResize
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
    ...propsRest
  } = props;

  const {
    formatItemLabel,
    ref: dropdownPropsRef,
    onBlur: onDropdownBlur,
    ...dropdownPropsRest
  } = dropdownProps;

  const dropdownRef = React.useRef<MenuProviderRef | null>(null);
  const mergedDropdownRef = mergeRefs(dropdownPropsRef, dropdownRef);

  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const mergedInputRef = mergeRefs(ref, inputRef);
 
  const [inputValue, setInputValue] = React.useState(() => {
    return selected
      ? formatItemLabel?.(selected) ?? ''
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
        // selection is controlled input value is uncontrolled
        updateInputValue(formatItemLabel?.(selected) ?? '');
      }
    },
    [selected, formatItemLabel, updateInputValue],
  );

  const selectedSet = React.useMemo(() => selectionStateFromItemKey(selected), [selected]);
  const {
    internalSelected,
    handleInternalSelect,
  } = useComboBoxState({
    selected: selectedSet,
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
      role="combobox"
      triggerAction="combobox"
      keyboardInteractions="default" // FIXME
      placement="bottom-start"
      offset={1}
      selected={internalSelectedItemKey}
      onSelect={handleSelect}
      onBlur={handleDropdownFocusOut}
      formatItemLabel={formatItemLabel}
      {...dropdownPropsRest}
      ref={mergedDropdownRef}
    >
      {anchorRenderArgs => (
        <ComboBoxInput
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
