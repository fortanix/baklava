/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { NonUndefined } from '../../../../util/types.ts';

import * as React from 'react';
import { mergeRefs, mergeProps, mergeCallbacks } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { useControllableStateFromProps } from '../../../../util/hooks/useControllableState.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import { Tag } from '../../../text/Tag/Tag.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import {
  type ItemKey,
  type SelectedState,
  type SelectedChangeEvent,
  type SelectedStateProps,
  type ListBoxMultiProviderRef,
  ListBoxMultiProvider,
} from '../../../overlays/ListBoxMultiProvider/ListBoxMultiProvider.tsx';

import cl from './SelectComboBoxMulti.module.scss';


export { cl as SelectClassNames };

export type { ItemKey, SelectedState };
export type SelectInputProps = ComponentProps<typeof InputDefault>;

const noop = () => {};


// Note: in the future we might expand on this ref to include things like the current filter value or input DOM ref
export type SelectComboBoxMultiRef = ListBoxMultiProviderRef;


type SelectedListProps = React.ComponentProps<'div'> & {
  /** Render the given selected option as a string label. */
  formatSelected: (selected: ItemKey) => string,
  
  /** The currently selected options. If `undefined`, this component will be considered uncontrolled. */
  selected: NonUndefined<SelectedStateProps['selected']>,
  
  /** Event handler to be called when the selected options state changes. */
  onSelectedChange: NonUndefined<SelectedStateProps['onSelectedChange']>,
  
  /** Whether to show a "clear" action that triggers an update for the selected list to be empty. Default: `true`. */
  showClearAction?: undefined | boolean,
  
  /** Any additional actions to show at the end of the selected list. */
  actions?: undefined | React.ReactNode,
};
export const SelectedList = (props: SelectedListProps) => {
  const { formatSelected, selected, onSelectedChange, showClearAction = true, actions, ...propsRest } = props;
  
  const handleRemove = React.useCallback((itemKey: ItemKey) => () => {
    const selectedUpdated = new Set([...selected].filter(current => current !== itemKey));
    onSelectedChange({ selected: selectedUpdated });
  }, [selected, onSelectedChange]);
  
  const handleClick = React.useCallback((event: React.MouseEvent) => {
    // When the user clicks the remove button, prevent triggering the dropdown click behavior
    if (event.target instanceof HTMLButtonElement) {
      event.stopPropagation();
    }
  }, []);
  
  const handleKeyEvent = React.useCallback((event: React.KeyboardEvent) => {
    // When the user uses Space/Enter to activate the remove button, prevent triggering the dropdown activation behavior
    if (event.target instanceof HTMLButtonElement && [' ', 'Enter'].includes(event.key)) {
      event.stopPropagation();
    }
  }, []);
  
  const handleClearAction = React.useCallback(() => {
    onSelectedChange?.({ selected: new Set() });
  }, [onSelectedChange]);
  
  // FIXME: loses focus on clicking remove
  // Note: in the future we could perhaps rely on the `focusreset` event
  // https://chromestatus.com/feature/5068521917775872
  
  // Prevent unnecessary flex gap from showing in case of an empty list
  if (selected.size === 0) { return null; }
  
  return (
    <div
      className={cx(cl['bk-select-combo-box-multi-selected-list'])}
      {...mergeProps(
        {
          onClick: handleClick,
          onKeyDown: handleKeyEvent,
          onKeyUp: handleKeyEvent,
        },
        propsRest,
      )}
    >
      {[...selected].map(itemKey =>
        <Tag
          key={itemKey}
          className={cx(cl['bk-select-combo-box-multi-selected-list__tag'])}
          content={formatSelected(itemKey)}
          onRemove={handleRemove(itemKey)}
        />
      )}
      
      <span className={cx(cl['bk-select-combo-box-multi-selected-list__actions'])}>
        {showClearAction && selected.size > 0 &&
          // FIXME: clicking clear causes focus to be lost
          <Button trimmed kind="tertiary" label="Clear all" onPress={handleClearAction}/>
        }
        {actions}
      </span>
    </div>
  );
};


type FilterStateProps = {
  /** The current filter value. If `undefined`, this component will be considered uncontrolled. */
  filter?: undefined | string,
  
  /** Event handler to be called when the filter value changes. */
  onFilterChange?: undefined | ((filter: string) => void),
  
  // Note: no `defaultFilter` here, since it's never useful (given that we update the filter on focus anyway)
};

export type SelectComboBoxMultiProps =
  Omit<SelectInputProps, 'ref' | 'value' | 'defaultValue' | 'onChange' | 'onSelect'>
  & FilterStateProps
  & SelectedStateProps
  & {
    /** Whether this component should be unstyled. */
    unstyled?: undefined | boolean,
    
    /** A React ref to control the combobox imperatively. */
    ref?: undefined | React.Ref<null | SelectComboBoxMultiRef>,
    
    /** A human-readable name for the select. */
    label: string,
    
    /** Render the given selected option as a string label. */
    formatSelected: SelectedListProps['formatSelected'],
    
    /** The options list to be shown in the dropdown menu. */
    options: React.ComponentProps<typeof ListBoxMultiProvider>['items'],
    
    /** Whether to render the selected options inline in the input. Default: `true`. */
    renderSelectedInline?: undefined | boolean,
    
    /** Additional props to be passed to the `ListBoxMultiProvider`. */
    dropdownProps?: undefined | Partial<React.ComponentProps<typeof ListBoxMultiProvider>>,
    
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
export const SelectComboBoxMulti = Object.assign(
  (props: SelectComboBoxMultiProps) => {
    const {
      unstyled = false,
      ref,
      label,
      formatSelected,
      // Dropdown
      options,
      defaultSelected,
      selected,
      onSelectedChange,
      renderSelectedInline = true,
      dropdownProps = {},
      // Input
      filter,
      onFilterChange,
      Input = InputDefault,
      containerProps,
      inputProps,
      
      // @ts-expect-error Exclude all the emitted props from `propsRest`
      value, defaultValue, onChange, onSelect,
      ...propsRest
    } = props;
    
    const InputAction = Input.Action ?? InputDefault.Action;
    
    const listBoxProviderRef = React.useRef<ListBoxMultiProviderRef>(null);
    const inputRef = React.useRef<React.ComponentRef<typeof InputDefault>>(null);
    
    const { state: filterState, requestStateChange: updateFilterState } = useControllableStateFromProps<string>(
      {
        state: filter,
        defaultState: '',
        onStateChange: onFilterChange,
      },
      {
        debugName: 'SelectComboBoxMulti',
        propName: 'filter',
        defaultStateFallback: '',
        stateFromEvent: state => state,
      },
    );
    
    // Track `selected` state
    const {
      state: selectedState,
      requestStateChange: requestSelectedChange,
    } = useControllableStateFromProps<SelectedState, SelectedChangeEvent>(
      {
        state: selected,
        defaultState: defaultSelected,
        onStateChange: onSelectedChange,
      },
      {
        debugName: 'MenuMultiProvider',
        propName: 'selected',
        defaultStateFallback: new Set(),
        stateFromEvent: event => event.selected,
      },
    );
    
    const handleSelectedChange = React.useCallback((event: SelectedChangeEvent) => {
      // FIXME: do we want to clear the filter after a selection? Maybe not since the user may want to select several
      // options with the same filter
      //if (event.reason === 'user-request') { updateFilterState(''); }
    }, []);
    
    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      updateFilterState(event.target.value);
      
      const listBoxProvider = listBoxProviderRef.current;
      if (listBoxProvider && !listBoxProvider.open) {
        // Re-open menu when typing
        listBoxProvider.requestOpenChange({ open: true });
      }
    }, [updateFilterState]);
    
    const handleInputKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (!renderSelectedInline) { return; }
      
      if (filterState === '' && event.key === 'Backspace' && selectedState.size > 0) {
        requestSelectedChange({ selected: new Set(Array.from(selectedState).slice(0, -1)) });
      }
    }, [filterState, selectedState, renderSelectedInline, requestSelectedChange]);
    
    const handleContainerFocusChange = React.useCallback(({ focused }: { focused: boolean }) => {
      if (focused) {
        // Note: don't do this. Just focusing the input shouldn't automatically open the menu, only after the user gives
        // us an intent (arrow keys, input change). Clicking the input _should_ open the menu (also, if we were to do
        // the line below than this will conflict with that click event).
        //listBoxProvider.requestOpenChange({ open: true });
      } else {
        // Reset the text input
        updateFilterState('');
        
        // FIXME: allow the user to type in an option directly (without going through the menu)?
        // Would require something like a `selectedFromValue` function.
        //const selectedMatch: undefined | SelectedState = selectedFromValue(event.target.value);
        //if (typeof selectedMatch !== 'undefined') { ... }
      }
    }, [updateFilterState]);
    
    
    // Render inline selected list
    const handleSelectedListKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        inputRef.current?.focus();
      }
    }, []);
    const selectedInline = renderSelectedInline && (
      <SelectedList
        formatSelected={formatSelected}
        selected={selectedState}
        onSelectedChange={mergeCallbacks([handleSelectedChange, requestSelectedChange])}
        onKeyDown={handleSelectedListKeyDown}
        showClearAction={false}
      />
    );
    
    return (
      <ListBoxMultiProvider
        ref={mergeRefs(ref, listBoxProviderRef)}
        label={label}
        items={options}
        triggerAction="combobox"
        popoverBehavior="auto" // FIXME: should just make this the new default in `ListBoxMultiProvider`?
        keyboardInteractions="form-control"
        placement="bottom-start"
        offset={1} // Make the dropdown flush with the input element
        {...dropdownProps}
        selected={selectedState}
        //defaultSelected={defaultSelected} // Do not pass, since `selectedState` is controlled
        onSelectedChange={mergeCallbacks([handleSelectedChange, requestSelectedChange])}
        onContainerFocusChange={mergeCallbacks([handleContainerFocusChange, dropdownProps.onContainerFocusChange])}
      >
        {({ props, open, selectedOptions }) => {
          // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
          const propsAnchor = props(mergeProps(
            {
              role: 'combobox',
              automaticResize: true,
              placeholder: 'Select options',
              'aria-disabled': true,
              className: cx(cl['bk-select-combo-box-multi']),
              formValue: Array.from(selectedOptions) ?? undefined,
              actions: (
                <InputAction
                  // Note: the toggle button should be focusable, but not in tab sequence, according to:
                  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/combobox_role
                  tabIndex={-1}
                  icon="caret-down"
                  className={cx(cl['bk-select-combo-box-multi__arrow'])}
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
              onKeyDown: handleInputKeyDown,
            },
          ));
          
          return (
            <Input
              {...propsAnchor}
              prefix={
                <>
                  {selectedInline}
                  {propsAnchor.prefix}
                </>
              }
              inputProps={mergeProps(
                { className: cx(cl['bk-select-combo-box-multi__input']) },
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
      </ListBoxMultiProvider>
    );
  },
  {
    Option: ListBoxMultiProvider.Option,
    Static: ListBoxMultiProvider.Static,
    Segment: ListBoxMultiProvider.Segment,
    SegmentVirtual: ListBoxMultiProvider.SegmentVirtual,
    Group: ListBoxMultiProvider.Group,
    Footer: ListBoxMultiProvider.Footer,
    SelectedList,
  },
);
