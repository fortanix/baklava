/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { useControllableStateFromProps } from '../../../../util/hooks/useControllableState.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  type SelectedState,
  type ListBoxProviderRef,
  ListBoxProvider,
} from '../../../overlays/ListBoxProvider/ListBoxProvider.tsx';

import cl from './SelectComboBox.module.scss';


export { cl as SelectClassNames };

export type { ItemKey, SelectedState };
export type SelectInputProps = ComponentProps<typeof InputDefault>;

const noop = () => {};


export type SelectComboBoxProps = Omit<SelectInputProps, 'value' | 'defaultValue' | 'onChange' | 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the select. */
  label: string,
  
  /** Render the currently selected option as a string label. If `null`, uses the placeholder instead. */
  formatSelected: (selectedOptions: SelectedState) => null | string,
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof ListBoxProvider>['items'],
  
  /** The current filter value. If `undefined`, this component will be considered uncontrolled. */
  filter?: undefined | string,
  
  /** The default filter value. Only relevant for uncontrolled usage (i.e. `filter` is `undefined`). */
  defaultFilter?: undefined | string,
  
  /** Event handler to be called when the filter value changes. */
  onFilterChange?: undefined | ((filter: string) => void),
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: React.ComponentProps<typeof ListBoxProvider>['selected'],
  
  /** The default option to select. Only relevant for uncontrolled usage (i.e. `selected` is `undefined`). */
  defaultSelected?: React.ComponentProps<typeof ListBoxProvider>['defaultSelected'],
  
  /** Event handler to be called when the selected option state changes. */
  onSelectedChange?: React.ComponentProps<typeof ListBoxProvider>['onSelectedChange'],
  
  /** Additional props to be passed to the `ListBoxProvider`. */
  dropdownProps?: undefined | Partial<React.ComponentProps<typeof ListBoxProvider>>,
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<SelectInputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
};
/**
 * A combobox with an input as anchor (displaying the currently selected item), and a single-select listbox as popover
 * from which the user can select an option.
 * 
 * References:
 * - [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
*/
export const SelectComboBox = Object.assign(
  (props: SelectComboBoxProps) => {
    const {
      unstyled = false,
      label,
      formatSelected,
      options,
      Input = InputDefault,
      containerProps,
      inputProps,
      filter,
      defaultFilter,
      onFilterChange,
      // Dropdown props
      defaultSelected,
      selected,
      onSelectedChange,
      dropdownProps = {},
      
      // @ts-expect-error Exclude all the emitted props from `propsRest`
      value, defaultValue, onChange, onSelect,
      ...propsRest
    } = props;
    
    const InputAction = Input.Action ?? InputDefault.Action;
    
    const listBoxProviderRef = React.useRef<ListBoxProviderRef>(null);
    
    const { state: filterState, requestStateChange: updateFilterState } = useControllableStateFromProps<string>(
      {
        state: filter,
        defaultState: defaultFilter,
        onStateChange: onFilterChange,
      },
      {
        debugName: 'SelectComboBox',
        propName: 'filter',
        defaultStateFallback: '',
        stateFromEvent: state => state,
      },
    );
    
    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      updateFilterState(event.target.value);
    }, [updateFilterState]);
    
    // Note: make sure this is always a `string` not `undefined` (since that implies an uncontrolled input)
    const valueFromSelected = React.useCallback((selectedOption: SelectedState): string => {
      if (typeof formatSelected === 'function') {
        return formatSelected(selectedOption) ?? '';
      } else {
        // Fallback: show the option key directly
        return selectedOption ?? '';
      }
    }, [formatSelected]);
    
    // FIXME: this doesn't cover the case where focus is in the popover and we close it (e.g. click outside)
    const handleInputBlur = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = listBoxProviderRef.current?.selected ?? null;
      //updateFilterState(selected !== null ? valueFromSelected(selected) : '');
    }, [valueFromSelected, updateFilterState]);
    
    return (
      <ListBoxProvider
        ref={listBoxProviderRef}
        label={label}
        items={options}
        triggerAction="combobox"
        keyboardInteractions="form-control"
        placement="bottom-start"
        offset={0} // Make the dropdown flush with the input element
        {...dropdownProps}
        selected={selected}
        defaultSelected={defaultSelected}
        onSelectedChange={onSelectedChange}
      >
        {({ props, open, requestOpen, selectedOption }) => {
          // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
          const { ref: anchorRef, ...propsAnchor } = props(mergeProps(
            {
              role: 'combobox',
              automaticResize: true,
              placeholder: 'Select an option',
              'aria-disabled': true,
              className: cx(cl['bk-select-combo-box']),
              formValue: selectedOption ?? undefined,
              actions: (
                <InputAction
                  // Note: the toggle button should be focusable, but not in tab sequence, according to:
                  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/combobox_role
                  tabIndex={-1}
                  icon="caret-down"
                  className={cx(cl['bk-select-combo-box__arrow'])}
                  label={open ? 'Close dropdown' : 'Open dropdown'}
                  onPress={noop} // Do nothing, but let it bubble to the parent to handle open/close
                />
              ),
            },
            propsRest,
            {
              value: filterState,
              onChange: handleInputChange,
              onBlur: handleInputBlur,
            },
          ));
          
          return (
            <Input
              {...propsAnchor}
              ref={anchorRef} // TEMP
              inputProps={mergeProps(
                { className: cx(cl['bk-select-combo-box__input']) },
                inputProps,
              )}
              // containerProps={mergeProps(
              //   // Anchor the dropdown to the container, not the inner input
              //   { ref: anchorRef },
              //   containerProps,
              // )}
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
