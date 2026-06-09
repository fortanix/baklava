/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  type ItemDetails,
  MenuProvider,
} from '../../../overlays/MenuProvider/MenuProvider.tsx';

import cl from './Select.module.scss';
import { SelectComboBox } from '../SelectComboBox/SelectComboBox.tsx';


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
  
  /** Render the given item key as a string label. */
  formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
  
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
      label,
      options,
      // Dropdown props
      dropdownProps = {},
      Input = InputDefault,
      automaticResize = false,
      ...propsRest
    } = props;
    
    const InputAction = Input.Action ?? InputDefault.Action;
    const [open, onOpenChange] = React.useState(dropdownProps.open ?? false);

    return (
      <SelectComboBox
        label={label}
        options={options}
        dropdownProps={{
          offset: 0, // Make the dropdown flush with the select element
          open,
          onOpenChange,
          ...dropdownProps
        }}
        placeholder="Select an option"
        Input={Input}
        automaticResize={automaticResize}
        {...propsRest}
        aria-disabled={true}
        readOnly={true}
        inputProps={{
          ...propsRest.inputProps,
          className: cx(cl['bk-select__input'], propsRest.inputProps?.className),
        }}
        containerProps={{
          ...propsRest.containerProps,
          className: cx(cl['bk-select'], { [cl['bk-select--open']]: open }, propsRest.containerProps?.className),
        }}
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
      />
    );
  },
  {
    Static: MenuProvider.Static,
    Option: MenuProvider.Option,
    Header: MenuProvider.Header,
    Action: MenuProvider.Action,
    FooterActions: MenuProvider.FooterActions,
  },
);
