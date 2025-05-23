/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { mergeProps } from '../../../../util/reactUtil.ts';

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  type ItemDetails,
  MenuProvider,
} from '../../../overlays/MenuProvider/MenuProvider.tsx';

import cl from './Select.module.scss';


export { cl as SelectClassNames };

export type { ItemKey, ItemDetails };
export type SelectInputProps = ComponentProps<typeof InputDefault>;

/*
A `Select` is a single-select non-editable combobox.

References:
- [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
*/

export type SelectProps = Omit<SelectInputProps, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the select. */
  label: string,
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof MenuProvider>['items'],
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<SelectInputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
  
  /** The default option to select. Only relevant for uncontrolled usage (i.e. `selected` is `undefined`). */
  defaultSelected?: undefined | null | ItemKey,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | null | ItemKey,
  
  /** Event handler to be called when the selected option state changes. */
  onSelect?: undefined | ((selectedItemKey: null | ItemKey, selectedItemDetails: null | ItemDetails) => void),
  
  /** Additional props to be passed to the `MenuProvider`. */
  dropdownProps?: undefined | Partial<React.ComponentProps<typeof MenuProvider>>,
};
export const Select = Object.assign(
  (props: SelectProps) => {
    const {
      unstyled = false,
      label,
      options,
      automaticResize,
      Input = InputDefault,
      // Dropdown props
      defaultSelected,
      selected,
      onSelect,
      dropdownProps = {},
      // Hidden input props
      name,
      form,
      ...propsRest
    } = props;
    
    const InputAction = Input.Action ?? InputDefault.Action;
    
    return (
      <MenuProvider
        label={label}
        items={options}
        // biome-ignore lint/a11y/useSemanticElements: False positive: this `role` doesn't directly map to HTML `role`
        role="listbox"
        keyboardInteractions="form-control"
        placement="bottom-start"
        offset={0} // Make the dropdown flush with the select element
        selected={selected}
        onSelect={onSelect}
        {...dropdownProps}
      >
        {({ props, open, requestOpen, selectedOption }) => {
          // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
          const { ref: anchorRef, ...anchorProps } = props({
            placeholder: 'Select an option',
            'aria-disabled': true,
            readOnly: true, // Make the input non-editable, but still focusable
            ...propsRest,
            className: cx(cl['bk-select'], { [cl['bk-select--open']]: open }, propsRest.className),
            value: selectedOption === null ? '' : selectedOption.label,
            onChange: () => {},
          });
          
          const propsMerged = mergeProps(
            propsRest,
            anchorProps,
          );
          
          return (
            <>
              <Input
                role="combobox"
                automaticResize={automaticResize}
                actions={
                  <InputAction
                    // Note: the toggle button should not be focusable, according to:
                    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/combobox_role
                    tabIndex={-1}
                    icon="caret-down"
                    className={cx(cl['bk-select__arrow'])}
                    label={open ? 'Close dropdown' : 'Open dropdown'}
                    onPress={() => {}}
                  />
                }
                {...propsMerged}
                inputProps={{
                  ...propsMerged.inputProps,
                  className: cx(cl['bk-select__input'], propsMerged.inputProps?.className),
                }}
                containerProps={{
                  ...propsMerged.containerProps,
                  // Anchor the dropdown to the container, not the inner input
                  ref: anchorRef as React.Ref<HTMLDivElement>,
                }}
              />
              {/* Render a hidden input with the selected option key (rather than the human-readable label). */}
              {typeof name === 'string' &&
                <input type="hidden" form={form} name={name} value={selectedOption?.itemKey ?? ''}/>
              }
            </>
          );
        }}
      </MenuProvider>
    );
  },
  {
    Header: MenuProvider.Header,
    Option: MenuProvider.Option,
    Action: MenuProvider.Action,
    FooterActions: MenuProvider.FooterActions,
  },
);
