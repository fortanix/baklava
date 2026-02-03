/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { mergeProps } from '../../../../util/reactUtil.ts';

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
import { useComboBoxState } from '../ComboBoxMulti/ComboBoxMulti.tsx';
import { Tag } from '../../../text/Tag/Tag.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

// Styles
import cl from './ComboBoxMultiLazy.module.scss';


export { cl as ComboBoxMultiLazyClassNames };
export type { ItemKey, ItemDetails, VirtualItemKeys };
type InputProps = ComponentProps<typeof InputDefault>;


// COMBO BOX MULTI LAZY INPUT
// ---------------------------------------------------------------------------------------------------------------------

type ComboBoxMultiLazyInputProps = Omit<InputProps, 'onSelect'> & {
  anchorRenderArgs: AnchorRenderArgs,
  onUpdate?: undefined | MenuMultiLazyProviderProps['onSelect'],
  Input?: undefined | React.ComponentType<InputProps>,
};

const ComboBoxMultiLazyInput = (props: ComboBoxMultiLazyInputProps) => {
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
    selectedOptions,
  } = anchorRenderArgs;
    
  // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
  const anchorProps = anchorRenderProps({
    placeholder: 'Select options',
    className: cx(cl['bk-combo-box'], { [cl['bk-combo-box--open']]: open }),
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
        automaticResize
        {...mergeProps(anchorProps, propsRest)}
        inputProps={{
          ...propsRest.inputProps,
          className: cx(cl['bk-combo-box__input'], propsRest.inputProps?.className),
        }}
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

type DropdownProps = Omit<MenuMultiLazyProviderProps, 'label'>;

// COMBO BOX MULTI LAZY
// ---------------------------------------------------------------------------------------------------------------------

/**
 * A `ComboBoxMultiLazy` is a text input control combined with a multi-selction dropdown menu that
 * lazily loads menu items and adapts to the user input, for example for automatic suggestions.
 * 
 * References: 
 * - [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
 */
export type ComboBoxMultiLazyProps = Omit<InputProps, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the combobox. */
  label: string,
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<InputProps>,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | Set<ItemKey>,
  
  /** Callback for when an option is selected in the dropdown menu. */
  onSelect?: undefined | React.ComponentProps<typeof MenuMultiLazyProvider>['onSelect'],
  
  /** Additional props to be passed to the `MenuMultiProvider`. */
  dropdownProps: DropdownProps,
};
export const ComboBoxMultiLazy = (props: ComboBoxMultiLazyProps) => {
  const {
    unstyled = false,
    label,
    Input = InputDefault,
    selected,
    onSelect,
    dropdownProps,
    ...propsRest
  } = props;

  const [inputValue, setInputValue] = React.useState(propsRest.value ?? '');

  const {
    internalSelected,
    handleInternalSelect,
  } = useComboBoxState({
    selected,
    formatItemLabel: dropdownProps.formatItemLabel,
  });

  const internalSelectedItemKeys: Set<ItemKey> = React.useMemo(
    () => new Set(internalSelected.keys()),
    [internalSelected],
  );

  const handleInputChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(evt.target.value);
  };

  const handleSelect = React.useCallback((itemKeys: Set<ItemKey>, itemDetails: Map<ItemKey, ItemDetails>) => {
    onSelect?.(itemKeys, itemDetails);
    setInputValue('');
    handleInternalSelect(itemKeys);
  }, [onSelect, handleInternalSelect]);

  const handleInputFocusOut = (_evt: React.FocusEvent<HTMLInputElement>) => {
    setInputValue('');
  };

  return (
    <MenuMultiLazyProvider
      label={label}
      role="combobox"
      triggerAction="focus-interactive" // Keep the dropdown menu open while the input is focused
      keyboardInteractions="default" // FIXME
      placement="bottom-start"
      offset={1}
      selected={internalSelectedItemKeys}
      onSelect={handleSelect}
      {...dropdownProps}
    >
      {anchorRenderArgs => (
        <ComboBoxMultiLazyInput
          anchorRenderArgs={anchorRenderArgs}
          Input={Input}
          value={inputValue}
          onChange={handleInputChange}
          onUpdate={handleSelect}
          onBlur={handleInputFocusOut}
          {...propsRest}
        />
      )}
    </MenuMultiLazyProvider>
  );
};

