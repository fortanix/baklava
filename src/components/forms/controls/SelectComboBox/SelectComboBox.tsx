/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps, mergeRefs } from '../../../../util/reactUtil.ts';
import { useControllableStateTrackerWithEvent } from '../../../../util/hooks/useControllableState.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

// Components
import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  type SelectedState,
  type AnchorRenderArgs,
  type ListBoxProviderProps,
  type ListBoxProviderRef,
  ListBoxProvider,
} from '../../../overlays/ListBoxProvider/ListBoxProvider.tsx';
import { selectionStateFromItemKey } from '../../../overlays/MenuMultiProvider/MenuMultiProvider.tsx';
//import { useSelectComboBoxState } from '../SelectComboBoxMulti/SelectComboBoxMulti.tsx';
const useSelectComboBoxState = () => ({ // FIXME
  internalSelected: new Set(),
  handleInternalSelect: () => {},
});

// Styles
import cl from './SelectComboBox.module.scss';


export { cl as SelectComboBoxClassNames };
export type { ItemKey };
type InputProps = ComponentProps<typeof InputDefault>;

const noop = () => {};

type SelectComboBoxInputProps = Omit<InputProps, 'onSelect'> & {
  anchorRenderArgs: AnchorRenderArgs,
  Input?: undefined | React.ComponentType<InputProps>,
};
/** Utility: the input that is used as part of the combobox. */
const SelectComboBoxInput = (props: SelectComboBoxInputProps) => {
  const {
    ref,
    anchorRenderArgs,
    Input = InputDefault,
    // Form-association props (to be redirected to hidden input)
    name,
    form,
    ...propsRest
  } = props;
  
  return (
    <>
      <Input
        role="combobox"
        automaticResize
        {...propsRest}
        inputProps={{
          placeholder: 'Select options',
          ...propsRest.inputProps,
          className: cx(cl['bk-combo-box__input'], propsRest.inputProps?.className),
        }}
        containerProps={propsRest.containerProps ?? {}}
      />
      
      {/* Render a hidden input with the selected option key (rather than the human-readable label). */}
      {typeof name === 'string' &&
        <input type="hidden" form={form} name={name} value={selectedOption ?? ''}/>
      }
    </>
  );
};

/**
 * A `SelectComboBox` is a text input control combined with a dropdown menu that adapts to the user input,
 * for example for automatic suggestions.
 * 
 * References: 
 * - [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
 */
export type SelectComboBoxProps = Omit<InputProps, 'onSelect'> & {
  /** A human-readable name for the combobox. */
  label: string,
  
  /** Render the given item key as a string label. */
  formatItemLabel: (itemKey: ItemKey) => string,
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof ListBoxProvider>['items'],
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | SelectedState,
  
  /** The default option to select. Only relevant for uncontrolled usage (i.e. `selected` is `undefined`). */
  defaultSelected?: undefined | SelectedState,
  
  /** Callback for when an option is selected in the dropdown menu. */
  onSelectedChange?: undefined | React.ComponentProps<typeof ListBoxProvider>['onSelectedChange'],
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<InputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
  
  /** Additional props to be passed to the `ListBoxProvider`. */
  dropdownProps?: undefined | Partial<ListBoxProviderProps>,
};
export const SelectComboBox = Object.assign(
  (props: SelectComboBoxProps) => {
    const {
      ref,
      unstyled = false,
      value,
      defaultValue,
      onChange,
      label,
      formatItemLabel,
      options,
      Input = InputDefault,
      selected,
      defaultSelected,
      onSelectedChange,
      onBlur,
      containerProps,
      inputProps,
      dropdownProps = {},
      ...propsRest
    } = props;
    
    const {
      ref: dropdownPropsRef,
      onBlur: onDropdownBlur,
      ...dropdownPropsRest
    } = dropdownProps;
    
    
    //
    // State: `value`
    //
    
    type InputValue = string | number | ReadonlyArray<string>;
    // const { state: valueState, updateState: updateValueState } = useControllableState<InputValue>({
    //   componentName: 'SelectComboBox',
    //   propName: 'value',
    //   state: value,
    //   defaultState: defaultValue,
    //   defaultStateFallback: '',
    //   onStateChange: onChange,
    // });
    const valueTracked = useControllableStateTrackerWithEvent<InputValue, React.ChangeEvent<HTMLInputElement>>(
      { state: value, defaultState: defaultValue, defaultStateFallback: '', onStateChange: onChange },
      event => event.target.value,
    );
    console.log('x', valueTracked);
    
    
    
    
    
    const dropdownRef = React.useRef<null | ListBoxProviderRef>(null);
    const mergedDropdownRef = mergeRefs(dropdownPropsRef, dropdownRef);
    
    const inputRef = React.useRef<null | HTMLInputElement>(null);
    const mergedInputRef = mergeRefs(ref, inputRef);
    
    const [inputValue, setInputValue] = React.useState(() => {
      const initialSelected = selected ?? defaultSelected;
      return initialSelected ? formatItemLabel(initialSelected) : (value ?? '');
    });
    
    const updateInputValue = React.useCallback((updatedValue: string) => {
      if (typeof value === 'undefined') {
        // Update only when input value is uncontrolled
        setInputValue(updatedValue);
      }
    }, [value]);
    
    React.useEffect(() => {
      if (selected) {
        // Update `Input` value state on selection change when menu selection is controlled and input
        // value is uncontrolled.
        updateInputValue(formatItemLabel(selected));
      }
    }, [selected, formatItemLabel, updateInputValue]);
    
    const selectedSet = React.useMemo(() => selectionStateFromItemKey(selected), [selected]);
    const defaultSelectedSet = React.useMemo(() => selectionStateFromItemKey(defaultSelected), [defaultSelected]);
    const { internalSelected, handleInternalSelect } = useSelectComboBoxState({
      selected: typeof selected !== 'undefined' ? selectedSet : defaultSelectedSet,
      formatItemLabel,
    });
    
    const updateInternalSelected = React.useCallback((updatedInternalSelected: Set<ItemKey>) => {
      if (typeof selected === 'undefined') {
        // Update only when menu selection is uncontrolled
        handleInternalSelect(updatedInternalSelected);
      }
    }, [selected, handleInternalSelect]);
    
    const internalSelectedItemKey: SelectedState = internalSelected.keys().next().value ?? null;
    
    const handleSelect = React.useCallback((itemKey: SelectedState) => {
      const itemLabel = itemKey !== null ? formatItemLabel(itemKey) : '';
      updateInputValue(itemLabel);
      updateInternalSelected(itemKey ? new Set([itemKey]) : new Set());
      onSelectedChange?.(itemKey);
    }, [formatItemLabel, onSelectedChange, updateInputValue, updateInternalSelected]);
    
    const handleDropdownFocusOut = (evt: React.FocusEvent<HTMLDivElement>) => {
      const inputEl = inputRef.current;
      if (inputEl?.contains(evt.relatedTarget as Node)) { return; }
      const floatingEl = dropdownRef.current?.floatingEl;
      if (floatingEl?.contains(evt.relatedTarget as Node)) { return; }
      updateInputValue(internalSelected.values().next().value?.label ?? '');
      onDropdownBlur?.(evt);
    };
    
    //
    // Input
    //
    
    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      
      if (typeof selected === 'undefined' && newValue === '') {
        handleSelect(null);
      }
      
      updateInputValue(newValue);
      onChange?.(event);
    }, [handleSelect]);
    
    const handleInputFocusOut = React.useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      const floatingEl = dropdownRef.current?.floatingEl;
      if (floatingEl?.contains(event.relatedTarget as Node)) { return; }
      updateInputValue(internalSelected.values().next().value?.label ?? '');
      onBlur?.(event);
    }, [internalSelected, onBlur, updateInputValue]);
    
    const renderInput = React.useCallback((anchorRenderArgs: AnchorRenderArgs) => {
      const { props: anchorRenderProps, open, selectedOption } = anchorRenderArgs;
      // const anchorProps = anchorRenderProps({
      //   ref,
      //   className: cx(
      //     cl['bk-combo-box'],
      //     { [cl['bk-combo-box--open']]: open },
      //     propsRest.className,
      //     propsRest.containerProps?.className,
      //   ),
      //   onBlur: propsRest.onBlur,
      //   onKeyDown: propsRest.onKeyDown,
      // });
      return (
        <Input
          {...anchorRenderProps()}
          //value={typeof value !== 'undefined' ? value : inputValue}
          //onChange={handleInputChange}
          defaultValue={defaultValue}
          onChange={valueTracked.onStateChange}
          onBlur={handleInputFocusOut}
          // {...propsRest}
          // ref={mergedInputRef}
        />
      );
    }, [Input, value, inputValue, handleInputChange, handleInputFocusOut]);
    
    return (
      <ListBoxProvider
        label={label}
        items={options}
        triggerAction="combobox"
        keyboardInteractions="form-control" // FIXME
        placement="bottom-start"
        offset={0} // Make the dropdown flush with the input element
        selected={internalSelectedItemKey}
        defaultSelected={defaultSelected}
        onSelectedChange={handleSelect}
        //onBlur={handleDropdownFocusOut}
        {...dropdownPropsRest}
        ref={mergedDropdownRef}
      >
        {({ props, open, requestOpen, selectedOption }) => {
          // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
          const { ref: anchorRef, ...propsAnchor } = props(mergeProps(
            {
              role: 'combobox',
              automaticResize: true,
              className: cx(cl['bk-select-combo-box'], { [cl['bk-select-combo-box--open']]: open }),
              formValue: selectedOption ?? undefined,
            },
            propsRest,
            {
              //value: selectedOption === null ? '' : formatItemLabel(selectedOption),
              //onChange: noop,
            },
          ));
          
          return (
            <Input
              {...propsAnchor}
              inputProps={mergeProps(
                { className: cx(cl['bk-select-combo-box__input']) },
                inputProps,
              )}
              containerProps={mergeProps(
                // Anchor the dropdown to the container, not the inner input
                { ref: anchorRef },
                containerProps,
              )}
            />
          );
        }}
      </ListBoxProvider>
    );
  },
  {
    Option: ListBoxProvider.Option,
    Static: ListBoxProvider.Static,
    Segment: ListBoxProvider.Segment,
    SegmentVirtual: ListBoxProvider.SegmentVirtual,
    Group: ListBoxProvider.Group,
    Footer: ListBoxProvider.Footer,
  },
);
