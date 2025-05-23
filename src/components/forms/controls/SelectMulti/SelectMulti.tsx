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

import cl from './SelectMulti.module.scss';


export { cl as SelectMultiClassNames };

export type { ItemKey, ItemDetails };
export type SelectMultiInputProps = ComponentProps<typeof InputDefault>;

/*
A `SelectMulti` is a single-select non-editable combobox.

References:
- [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
*/

export type SelectMultiProps = Omit<SelectMultiInputProps, 'selected' | 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A human-readable name for the select. */
  label: string,
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof MenuProvider>['items'],
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<SelectMultiInputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | null | ItemKey,
  
  /** Event handler to be called when the selected option state changes. */
  onSelect?: undefined | ((selectedItemKey: null | ItemKey, selectedItemDetails: null | ItemDetails) => void),
  
  /** Additional props to be passed to the `MenuProvider`. */
  dropdownProps?: undefined | Partial<React.ComponentProps<typeof MenuProvider>>,
};
export const SelectMulti = Object.assign(
  (props: SelectMultiProps) => {
    const {
      unstyled = false,
      label,
      options,
      Input = InputDefault,
      // Dropdown props
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
            className: cx(cl['bk-select-multi'], { [cl['bk-select-multi--open']]: open }, propsRest.className),
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
                automaticResize
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
