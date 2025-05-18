/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { mergeProps } from '../../../../util/reactUtil.ts';

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  DropdownMenuProvider,
} from '../../../../components/overlays/DropdownMenu/DropdownMenuProvider.tsx';

import cl from './Select.module.scss';


export { cl as SelectClassNames };

export type { ItemKey };
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
  
  /** The selected option. To access the selected option, pass a render prop. */
  children: (selectedOption: null | ItemKey) => React.ReactNode,
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof DropdownMenuProvider>['items'],
  
  /** A custom `Input` component. */
  Input?: undefined | React.ComponentType<SelectInputProps> & {
    Action?: undefined | React.ComponentType<ComponentProps<typeof InputDefault.Action>>,
  },
  
  /** Additional props to be passed to the `DropdownMenuProvider`. */
  dropdownProps?: undefined | React.ComponentProps<typeof DropdownMenuProvider>,
};
export const Select = Object.assign(
  (props: SelectProps) => {
    const {
      unstyled = false,
      label,
      children,
      options,
      Input = InputDefault,
      dropdownProps = {},
      // Hidden input props
      name,
      form,
      ...propsRest
    } = props;
    
    const InputAction = Input.Action ?? InputDefault.Action;
    
    return (
      <DropdownMenuProvider
        label={label}
        items={options}
        // biome-ignore lint/a11y/useSemanticElements: False positive: this `role` doesn't directly map to HTML `role`
        role="listbox"
        keyboardInteractions="form-control"
        placement="bottom-start"
        offset={0} // Make the dropdown flush with the select element
        {...dropdownProps}
      >
        {({ props, open, requestOpen, selectedOption }) => {
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
                automaticResize
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
      </DropdownMenuProvider>
    );
  },
  {
    Header: DropdownMenuProvider.Header,
    Option: DropdownMenuProvider.Option,
    Action: DropdownMenuProvider.Action,
    FooterActions: DropdownMenuProvider.FooterActions,
  },
);
