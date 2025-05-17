/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Input } from '../Input/Input.tsx';
import {
  type ItemKey,
  DropdownMenuProvider,
} from '../../../../components/overlays/DropdownMenu/DropdownMenuProvider.tsx';

import cl from './Select.module.scss';


export { cl as SelectClassNames };


/*
A `Select` is a single-select non-editable combobox.

References:
- [1] https://www.w3.org/WAI/ARIA/apg/patterns/combobox
*/

export type SelectProps = ComponentProps<typeof Input> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The selected account. To access the selected account, pass a render prop. */
  children: (selectedAccount: null | ItemKey) => React.ReactNode,
  
  /** The options list to be shown in the dropdown menu. */
  options: React.ComponentProps<typeof DropdownMenuProvider>['items'],
};
export const Select = Object.assign(
  (props: SelectProps) => {
    const {
      unstyled = false,
      children,
      options,
      name,
      form,
      ...propsRest
    } = props;
    
    return (
      <DropdownMenuProvider
        label="Account selector"
        items={options}
        // biome-ignore lint/a11y/useSemanticElements: False positive: this `role` doesn't directly map to HTML `role`
        role="listbox"
        keyboardInteractions="form-control"
        placement="bottom-start"
        offset={1}
      >
        {({ props, open, requestOpen, selectedOption }) => {
          const anchorProps = props({
            placeholder: 'Select an option',
            'aria-disabled': true,
            readOnly: true, // Make the input non-editable, but still focusable
            ...propsRest,
            className: cx(cl['bk-select'], { [cl['bk-select--open']]: open }, propsRest.className),
            value: selectedOption === null ? '' : selectedOption.label,
            onChange: () => {},
          });
          
          return (
            <>
              <Input
                automaticResize
                {...propsRest}
                {...anchorProps}
                inputProps={{ className: cx(cl['bk-select__input']) }}
                actions={
                  <Input.Action
                    // Note: the toggle button should not be focusable, according to:
                    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/combobox_role
                    tabIndex={-1}
                    icon="caret-down"
                    className={cx(cl['bk-select__arrow'])}
                    label={open ? 'Close dropdown' : 'Open dropdown'}
                    onPress={() => {}}
                  />
                }
              />
              {/* Render a hidden input with the selected option key (rather than the human-readable label). */}
              <input type="hidden" form={form} name={name} value={selectedOption?.itemKey ?? ''}/>
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
