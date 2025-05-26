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
  MenuMultiProvider,
} from '../../../overlays/MenuMultiProvider/MenuMultiProvider.tsx';

import cl from './SelectMulti.module.scss';


export { cl as SelectMultiClassNames };

export type { ItemKey, ItemDetails };
export type SelectMultiInputProps = ComponentProps<typeof InputDefault>;

/*
A `SelectMulti` is a single-select non-editable combobox.

References:
- [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
*/

export type SelectMultiProps = Omit<SelectMultiInputProps, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the select. */
  label: string,
  
  /** Render the given item key as a string label. */
  formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof MenuMultiProvider>['items'],
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<SelectMultiInputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
  
  /** The default option to select. Only relevant for uncontrolled usage (i.e. `selected` is `undefined`). */
  defaultSelected?: undefined | Set<ItemKey>,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | Set<ItemKey>,
  
  /** Event handler to be called when the selected option state changes. */
  onSelect?: undefined | ((selectedItems: Set<ItemKey>, itemDetails: Map<ItemKey, ItemDetails>) => void),
  
  /** Additional props to be passed to the `MenuMultiProvider`. */
  dropdownProps?: undefined | Partial<React.ComponentProps<typeof MenuMultiProvider>>,
};
export const SelectMulti = Object.assign(
  (props: SelectMultiProps) => {
    const {
      unstyled = false,
      label,
      formatItemLabel,
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
      <MenuMultiProvider
        label={label}
        formatItemLabel={formatItemLabel}
        items={options}
        // biome-ignore lint/a11y/useSemanticElements: False positive: this `role` doesn't directly map to HTML `role`
        role="listbox"
        keyboardInteractions="form-control"
        placement="bottom-start"
        offset={0} // Make the dropdown flush with the select element
        defaultSelected={defaultSelected}
        selected={selected}
        onSelect={onSelect}
        {...dropdownProps}
      >
        {({ props, open, requestOpen, selectedOptions }) => {
          // @ts-ignore FIXME: `prefix` prop doesn't conform to `HTMLElement` type
          const { ref: anchorRef, ...anchorProps } = props({
            placeholder: 'Select options',
            'aria-disabled': true,
            readOnly: true, // Make the input non-editable, but still focusable
            ...propsRest,
            className: cx(cl['bk-select-multi'], { [cl['bk-select-multi--open']]: open }, propsRest.className),
            value: [...selectedOptions.values()].map(({ label }) => label).join(', '),
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
                    className={cx(cl['bk-select-multi__arrow'])}
                    label={open ? 'Close dropdown' : 'Open dropdown'}
                    onPress={() => {}}
                  />
                }
                {...propsMerged}
                inputProps={{
                  ...propsMerged.inputProps,
                  className: cx(cl['bk-select-multi__input'], propsMerged.inputProps?.className),
                }}
                containerProps={{
                  ...propsMerged.containerProps,
                  // Anchor the dropdown to the container, not the inner input
                  ref: anchorRef as React.Ref<HTMLDivElement>,
                }}
              />
              {/* Render a hidden input with the selected option key (rather than the human-readable label). */}
              {typeof name === 'string' &&
                [...selectedOptions.entries()].map(([selectedOptionKey, selectedOption]) =>
                  <input
                    key={selectedOptionKey}
                    type="hidden"
                    name={`${name}[]`}
                    form={form}
                    value={selectedOptionKey}
                    onChange={() => {}}
                  />
                )
              }
            </>
          );
        }}
      </MenuMultiProvider>
    );
  },
  {
    Header: MenuMultiProvider.Header,
    Option: MenuMultiProvider.Option,
    Action: MenuMultiProvider.Action,
    FooterActions: MenuMultiProvider.FooterActions,
  },
);
