/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, mergeProps, mergeCallbacks, usePrevious } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { useControllableStateFromProps } from '../../../../util/hooks/useControllableState.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  type SelectedState,
  type SelectedChangeEvent,
  type SelectedStateProps,
  type ListBoxProviderRef,
  ListBoxProvider,
} from '../../../overlays/ListBoxProvider/ListBoxProvider.tsx';

import cl from './SelectComboBox.module.scss';


export { cl as SelectClassNames };

export type { ItemKey, SelectedState };
export type SelectInputProps = ComponentProps<typeof InputDefault>;

const noop = () => {};


// Note: in the future we might expand on this ref to include things like the current filter value or input DOM ref
export type SelectComboBoxRef = ListBoxProviderRef;

type FilterStateProps = {
  /** The current filter value. If `undefined`, this component will be considered uncontrolled. */
  filter?: undefined | string,
  
  /** Event handler to be called when the filter value changes. */
  onFilterChange?: undefined | ((filter: string) => void),
  
  // Note: no `defaultFilter` here, since it's never useful (given that we update the filter on focus anyway)
};

export type SelectComboBoxProps =
  Omit<SelectInputProps, 'ref' | 'value' | 'defaultValue' | 'onChange' | 'onSelect'>
  & FilterStateProps
  & SelectedStateProps
  & {
    /** Whether this component should be unstyled. */
    unstyled?: undefined | boolean,
    
    /** A React ref to control the combobox imperatively. */
    ref?: undefined | React.Ref<null | SelectComboBoxRef>,
    
    /** A human-readable name for the select. */
    label: string,
    
    /** Render the currently selected option as a string label. If `null`, uses the placeholder instead. */
    formatSelected: (selected: SelectedState) => null | string,
    
    /** The options list to be shown in the dropdown menu. */
    options: React.ComponentProps<typeof ListBoxProvider>['items'],
    
    /** Additional props to be passed to the `ListBoxProvider`. */
    dropdownProps?: undefined | Partial<React.ComponentProps<typeof ListBoxProvider>>,
    
    /** A custom `Input` component. */
    Input?: undefined | React.ComponentType<SelectInputProps> & {
      Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
    },
    
    /** Whether to allow the user to clear the selection state to `null` by clearing the text input. Default: `true`. */
    allowClear?: undefined | boolean,
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
      ref,
      label,
      formatSelected,
      options,
      Input = InputDefault,
      containerProps,
      inputProps,
      filter,
      //defaultFilter, // Not useful (since we update the filter on focus anyway)
      onFilterChange,
      // Dropdown props
      defaultSelected,
      selected,
      onSelectedChange,
      dropdownProps = {},
      allowClear = true,
      
      // @ts-expect-error Exclude all the emitted props from `propsRest`
      value, defaultValue, onChange, onSelect,
      ...propsRest
    } = props;
    
    const InputAction = Input.Action ?? InputDefault.Action;
    
    const listBoxProviderRef = React.useRef<ListBoxProviderRef>(null);
    const inputRef = React.useRef<React.ComponentRef<typeof InputDefault>>(null);
    
    // Note: make sure this is always a `string` not `undefined` (since that implies an uncontrolled input)
    const valueFromSelected = React.useCallback((selectedOption: SelectedState): string => {
      if (typeof formatSelected === 'function') {
        return formatSelected(selectedOption) ?? '';
      } else {
        // Fallback: show the option key directly
        return selectedOption ?? '';
      }
    }, [formatSelected]);
    
    const selectedInitial = typeof selected !== 'undefined' ? selected : (defaultSelected ?? null);
    const defaultFilter = typeof selected === 'undefined' ? valueFromSelected(selectedInitial) : undefined;
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
    
    const handleSelectedChange = React.useCallback((event: SelectedChangeEvent) => {
      updateFilterState(event.selected !== null ? valueFromSelected(event.selected) : '');
    }, [valueFromSelected, updateFilterState]);
    
    // Note: if the consumer has controlled `selected` state, and that controlled state changes, then our
    // `handleSelectedChange` won't (and shouldn't) get called, we have to keep track of these changes ourselves.
    const selectedPrev = usePrevious(selected);
    React.useEffect(() => {
      if (typeof selected === 'undefined') { return; }
      
      if (typeof selectedPrev === 'undefined' || selected !== selectedPrev) {
        handleSelectedChange({ selected });
      }
    }, [selected, selectedPrev, handleSelectedChange]);
    
    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      updateFilterState(event.target.value);
      
      const listBoxProvider = listBoxProviderRef.current;
      if (listBoxProvider && !listBoxProvider.open) {
        // Re-open menu when typing
        listBoxProvider.requestOpenChange({ open: true });
      }
    }, [updateFilterState]);
    
    const handleContainerFocusChange = React.useCallback(({ focused }: { focused: boolean }) => {
      const listBoxProvider = listBoxProviderRef.current;
      if (!listBoxProvider) { return; }
      
      if (focused) {
        // Note: don't do this. Just focusing the input shouldn't automatically open the menu, only after the user gives
        // us an intent (arrow keys, input change). Clicking the input _should_ open the menu (also, if we were to do
        // the line below than this will conflict with that click event).
        //listBoxProvider.requestOpenChange({ open: true });
      } else {
        // Reset the text input to match the currently selected option
        updateFilterState(listBoxProvider.selected !== null ? valueFromSelected(listBoxProvider.selected) : '');
        
        if (allowClear && inputRef.current?.value === '' && listBoxProvider.selected !== null) {
          // Note: make sure to include a programmatic `reason` to avoid the following situation:
          // - Select an option (e.g. Apple)
          // - Focus the input and clear it
          // - Focus back to the menu (causing an input blur)
          // - Notice: the menu closes suddenly because `ListBoxProvider` thinks the user selected a different option
          // - Solution: communicate in the `SelectedChangeEvent` that this is a programmatic change and not a user one
          listBoxProvider.requestSelectedChange({ selected: null, reason: 'programmatic' });
        }
        
        // FIXME: allow the user to type in an option directly (without going through the menu)?
        // Would require something like a `selectedFromValue` function.
        //const selectedMatch: undefined | SelectedState = selectedFromValue(event.target.value);
        //if (typeof selectedMatch !== 'undefined') { ... }
      }
    }, [valueFromSelected, updateFilterState, allowClear]);
    
    return (
      <ListBoxProvider
        ref={mergeRefs(ref, listBoxProviderRef)}
        label={label}
        items={options}
        triggerAction="combobox"
        popoverBehavior="auto" // FIXME: should just make this the new default in `ListBoxProvider`?
        keyboardInteractions="form-control"
        placement="bottom-start"
        offset={1} // Make the dropdown flush with the input element
        {...dropdownProps}
        selected={selected}
        defaultSelected={defaultSelected}
        onSelectedChange={mergeCallbacks([handleSelectedChange, onSelectedChange])}
        onContainerFocusChange={mergeCallbacks([handleContainerFocusChange, dropdownProps.onContainerFocusChange])}
      >
        {({ props, open, selectedOption }) => {
          // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
          const propsAnchor = props(mergeProps(
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
              ref: inputRef,
              value: filterState,
              onChange: handleInputChange,
            },
          ));
          
          return (
            <Input
              {...propsAnchor}
              inputProps={mergeProps(
                { className: cx(cl['bk-select-combo-box__input']) },
                inputProps,
              )}
              // Note: the following doesn't work well, since this results in the `togglePopover({ source })` element
              // being the container `<div>`, which is not valid. It results in issues, for instance automatic tab
              // ordering will no longer work.
              //containerProps={mergeProps(
              //  // Anchor the dropdown to the container, not the inner input
              //  { ref: anchorRef },
              //  containerProps,
              //)}
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
