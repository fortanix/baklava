/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  type SelectedState,
  ListBoxMultiProvider,
} from '../../../overlays/ListBoxMultiProvider/ListBoxMultiProvider.tsx';

import cl from './SelectMulti.module.scss';


export { cl as SelectClassNames };

export type { ItemKey, SelectedState };
export type SelectInputProps = ComponentProps<typeof InputDefault>;

const noop = () => {};


export type SelectMultiProps = Omit<SelectInputProps, 'value' | 'defaultValue' | 'onChange' | 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the select. */
  label: string,
  
  /** Render the given item key as a string label. */
  formatSelected: (selectedOption: SelectedState) => string,
  
  /** @deprecated Use `formatSelected` instead. */
  formatItemLabel?: undefined | ((selectedOption: ItemKey) => string),
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof ListBoxMultiProvider>['items'],
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | SelectedState,
  
  /** The default option to select. Only relevant for uncontrolled usage (i.e. `selected` is `undefined`). */
  defaultSelected?: undefined | SelectedState,
  
  /** Event handler to be called when the selected option state changes. */
  onSelectedChange?: undefined | ((selectedItemKeys: SelectedState) => void),
  
  /** Additional props to be passed to the `ListBoxMultiProvider`. */
  dropdownProps?: undefined | Partial<React.ComponentProps<typeof ListBoxMultiProvider>>,
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<SelectInputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
};
/**
 * `SelectMulti` is a combobox with a button as anchor (displaying the currently selected items), and a multiple-select
 * listbox as popover from which the user can select an item.
 * 
 * References:
 * - [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
*/
export const SelectMulti = Object.assign(
  (props: SelectMultiProps) => {
    const {
      unstyled = false,
      label,
      formatSelected,
      formatItemLabel,
      options,
      Input = InputDefault,
      containerProps,
      inputProps,
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
    
    const valueFromSelected = React.useCallback((selectedOptions: SelectedState): string => {
      if (typeof formatSelected === 'function') {
        return formatSelected(selectedOptions);
      } else if (typeof formatItemLabel === 'function') {
        // Note: the old `formatItemLabel` takes a single item, so we need to hardcode the `,` separator here
        return [...selectedOptions.values()].map(selectedOption => formatItemLabel(selectedOption)).join(', ');
      } else {
        // Fallback: show the option keys directly
        return [...selectedOptions.values()].join(', ');
      }
    }, [formatSelected, formatItemLabel]);
    
    return (
      <ListBoxMultiProvider
        label={label}
        items={options}
        triggerAction="click"
        keyboardInteractions="form-control"
        placement="bottom-start"
        offset={0} // Make the dropdown flush with the input element
        selected={selected}
        defaultSelected={defaultSelected}
        onSelectedChange={onSelectedChange}
        {...dropdownProps}
      >
        {({ props, open, requestOpen, selectedOptions }) => {
          // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
          const { ref: anchorRef, ...propsAnchor } = props(mergeProps(
            {
              role: 'combobox',
              automaticResize: true,
              placeholder: 'Select an option',
              'aria-disabled': true,
              className: cx(cl['bk-select-multi'], { [cl['bk-select-multi--open']]: open }),
              formValue: selectedOptions ?? [],
              actions: (
                <InputAction
                  // Note: the toggle button should be focusable but not in tab sequence, according to:
                  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/combobox_role
                  tabIndex={-1}
                  icon="caret-down"
                  className={cx(cl['bk-select-multi__arrow'])}
                  label={open ? 'Close dropdown' : 'Open dropdown'}
                  onPress={noop}
                />
              ),
            },
            propsRest,
            {
              value: valueFromSelected(selectedOptions),
              onChange: noop,
              // FIXME: ideally this would be a button, not a readonly input. We could introduce a `ButtonAsInput`?
              readOnly: true, // Make the input non-editable (but still focusable, unlike `disabled`)
            },
          ));
          
          return (
            <Input
              {...propsAnchor}
              inputProps={mergeProps(
                { className: cx(cl['bk-select-multi__input']) },
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
  },
);
