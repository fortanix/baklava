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
  MenuProvider,
  MenuProviderProps,
} from '../../../overlays/MenuProvider/MenuProvider.tsx';
import { useSelectComboBoxState } from '../SelectComboBoxMulti/SelectComboBoxMulti.tsx';
import { MenuProviderRef, selectionStateFromItemKey } from '../../../overlays/MenuMultiProvider/MenuMultiProvider.tsx';

// Styles
import cl from './SelectComboBox.module.scss';


export { cl as SelectComboBoxClassNames };
export type { ItemKey, ItemDetails };
type InputProps = ComponentProps<typeof InputDefault>;


// SELECT COMBO BOX INPUT
// ---------------------------------------------------------------------------------------------------------------------

type SelectComboBoxInputProps = Omit<InputProps, 'onSelect'> & {
  anchorRenderArgs: AnchorRenderArgs,
  onUpdate?: undefined | MenuProviderProps['onSelect'],
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

// SELECT COMBO BOX
// ---------------------------------------------------------------------------------------------------------------------

/**
 * A `SelectComboBox` is a text input control combined with a dropdown menu that adapts
 * to the user input, for example for automatic suggestions.
 * 
 * References: 
 * - [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
 */
export type SelectComboBoxProps = Omit<InputProps, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the combobox. */
  label: string,
  
  /** Render the given item key as a string label. */
  formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof MenuProvider>['items'],
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<InputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
    
  /** The default option to select. Only relevant for uncontrolled usage (i.e. `selected` is `undefined`). */
  defaultSelected?: undefined | null | ItemKey,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | null | ItemKey,
  
  /** Callback for when an option is selected in the dropdown menu. */
  onSelect?: undefined | React.ComponentProps<typeof MenuProvider>['onSelect'],

  /** Additional props to be passed to the `MenuProvider`. */
  dropdownProps?: undefined | Partial<MenuProviderProps>,
};
export const SelectComboBox = Object.assign(
  (props: SelectComboBoxProps) => {
    const {
      ref,
      unstyled = false,
      label,
      value,
      Input = InputDefault,
      options,
      selected,
      onSelect,
      onChange,
      onBlur,
      dropdownProps = {},
      defaultSelected,
      formatItemLabel,
      ...propsRest
    } = props;
    
    const {
      formatItemLabel: _, // Ignore
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
      <MenuProvider
        label={label}
        items={options}
        role="combobox"
        triggerAction="combobox"
        keyboardInteractions="form-control" // FIXME
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
