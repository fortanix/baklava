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
  type AnchorRenderArgs,
  type ItemDetails,
  type ItemKey,
  type VirtualItemKeys,
  MenuMultiLazyProvider,
  MenuMultiLazyProviderProps,
} from '../../../overlays/MenuMultiLazyProvider/MenuMultiLazyProvider.tsx';
import { type MenuProviderRef } from '../../../overlays/MenuMultiProvider/MenuMultiProvider.tsx';
import { useSelectComboBoxState } from '../SelectComboBoxMulti/SelectComboBoxMulti.tsx';
import { Tag } from '../../../text/Tag/Tag.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

// Styles
import cl from './SelectComboBoxMultiLazy.module.scss';


export { cl as SelectComboBoxMultiLazyClassNames };
export type { ItemKey, ItemDetails, VirtualItemKeys };
type InputProps = ComponentProps<typeof InputDefault>;


// SELECT COMBO BOX MULTI LAZY INPUT
// ---------------------------------------------------------------------------------------------------------------------

type SelectComboBoxMultiLazyInputProps = Omit<InputProps, 'onSelect'> & {
  anchorRenderArgs: AnchorRenderArgs,
  onUpdate?: undefined | MenuMultiLazyProviderProps['onSelect'],
  Input?: undefined | React.ComponentType<InputProps>,
};

const SelectComboBoxMultiLazyInput = (props: SelectComboBoxMultiLazyInputProps) => {
  const {
    ref,
    anchorRenderArgs,
    onUpdate,
    Input = InputDefault,
    automaticResize = true,
    // Hidden input props
    name,
    form,
    ...propsRest
  } = props;

  const {
    props: anchorRenderProps,
    open,
    selectedOptions,
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

  const onRemove = React.useCallback(
    (keysToRemove: Set<ItemKey>) => {
      const filteredItemDetails = new Map([...selectedOptions].filter(([key]) => !keysToRemove.has(key)));
      const filteredItemKeys = new Set(filteredItemDetails.keys());
      onUpdate?.(filteredItemKeys, filteredItemDetails);
    },
    [selectedOptions, onUpdate],
  );

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
      
      {selectedOptions.size > 0 && (
        <div className={cl['bk-combo-box__tags']}>
          {[...selectedOptions.entries()].map(([itemKey, itemDetails]) => (
            <Tag
              key={itemKey}
              className={cl['bk-combo-box__tag']}
              onRemove={() => { onRemove(new Set([itemKey])); }}
              content={itemDetails.label}
            />
          ))}

          <Button
            trimmed
            className={cl['bk-combo-box__btn-clear-all']}
            onPress={() => { onRemove(new Set(selectedOptions.keys())) }}
          >
            Clear
          </Button>
        </div> 
      )}

      {/* Render a hidden input with the selected option key (rather than the human-readable label). */}
      {typeof name === 'string' &&
        <>
          {[...selectedOptions.keys()].map(selectedItem =>
            <input
              key={selectedItem}
              type="hidden"
              form={form}
              name={`${name}[]`}
              value={selectedItem}
            />
          )}
        </>
      } 
    </>
  );
};


// SELECT COMBO BOX MULTI LAZY
// ---------------------------------------------------------------------------------------------------------------------

/**
 * A `SelectComboBoxMultiLazy` is a text input control combined with a multi-selction dropdown menu that
 * lazily loads menu items and adapts to the user input, for example for automatic suggestions.
 * 
 * References: 
 * - [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
 */
export type SelectComboBoxMultiLazyProps = Omit<InputProps, 'onSelect'> & {
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
  defaultSelected?: undefined | Set<ItemKey>,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | Set<ItemKey>,
  
  /** Callback for when an option is selected in the dropdown menu. */
  onSelect?: undefined | React.ComponentProps<typeof MenuMultiLazyProvider>['onSelect'],
  
  /** Additional props to be passed to the `MenuMultiLazyProvider`. */
  dropdownProps: Omit<MenuMultiLazyProviderProps, 'label' | 'formatItemLabel'>,
};
export const SelectComboBoxMultiLazy = (props: SelectComboBoxMultiLazyProps) => {
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

  const [inputValue, setInputValue] = React.useState(value ?? '');

  const updateInputValue = React.useCallback((updatedValue: string) => {
    if (typeof value === 'undefined') {
      // Update only when input value is uncontrolled
      setInputValue(updatedValue);
    }
  }, [value]);

  const {
    internalSelected,
    handleInternalSelect,
  } = useSelectComboBoxState({
    selected: typeof selected !== 'undefined' ? selected : defaultSelected,
    formatItemLabel,
  });

  const updateInternalSelected = React.useCallback((updatedInternalSelected: Set<ItemKey>) => {
    if (typeof selected === 'undefined') {
      // Update only when menu selection is uncontrolled
      handleInternalSelect(updatedInternalSelected);
    }
  }, [selected, handleInternalSelect]);

  const internalSelectedItemKeys: Set<ItemKey> = React.useMemo(
    () => new Set(internalSelected.keys()),
    [internalSelected],
  );

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    updateInputValue(evt.target.value);
    onChange?.(evt);
  };

  const handleSelect = React.useCallback((itemKeys: Set<ItemKey>, itemDetails: Map<ItemKey, ItemDetails>) => {
    updateInternalSelected(itemKeys);
    onSelect?.(itemKeys, itemDetails);
  }, [onSelect, updateInternalSelected]);

  const handleInputFocusOut = (evt: React.FocusEvent<HTMLInputElement>) => {
    const floatingEl = dropdownRef.current?.floatingEl;
    if (floatingEl?.contains(evt.relatedTarget as Node)) { return; }
    onBlur?.(evt);
  };

  const handleDropdownFocusOut = (evt: React.FocusEvent<HTMLDivElement>) => {
    const inputEl = inputRef.current;
    if (inputEl?.contains(evt.relatedTarget as Node)) { return; }
    const floatingEl = dropdownRef.current?.floatingEl;
    if (floatingEl?.contains(evt.relatedTarget as Node)) { return; }
    onDropdownBlur?.(evt);
  };

  return (
    <MenuMultiLazyProvider
      label={label}
      role="combobox"
      triggerAction="combobox"
      keyboardInteractions="default" // FIXME
      placement="bottom-start"
      offset={1}
      selected={internalSelectedItemKeys}
      onSelect={handleSelect}
      onBlur={handleDropdownFocusOut}
      formatItemLabel={formatItemLabel}
      defaultSelected={defaultSelected}
      {...dropdownPropsRest}
      ref={mergedDropdownRef}
    >
      {anchorRenderArgs => (
        <SelectComboBoxMultiLazyInput
          anchorRenderArgs={anchorRenderArgs}
          Input={Input}
          value={typeof value !== 'undefined' ? value : inputValue}
          onChange={handleInputChange}
          onUpdate={handleSelect}
          onBlur={handleInputFocusOut}
          {...propsRest}
          ref={mergedInputRef}
        />
      )}
    </MenuMultiLazyProvider>
  );
};

