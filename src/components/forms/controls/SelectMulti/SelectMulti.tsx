/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { Input as InputDefault } from '../Input/Input.tsx';
import {
  type ItemKey,
  type ItemDetails,
  MenuMultiProvider,
} from '../../../overlays/MenuMultiProvider/MenuMultiProvider.tsx';
import { SelectComboBoxMulti } from '../SelectComboBoxMulti/SelectComboBoxMulti.tsx';

import cl from './SelectMulti.module.scss';


export { cl as SelectMultiClassNames };

export type { ItemKey, ItemDetails };
export type SelectMultiInputProps = ComponentProps<typeof InputDefault>;

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
      label,
      options,
      // Dropdown props
      dropdownProps = {},
      Input = InputDefault,
      ...propsRest
    } = props;

    const InputAction = Input.Action ?? InputDefault.Action;
    const [open, onOpenChange] = React.useState(dropdownProps.open ?? false);

    return (
      <SelectComboBoxMulti
        label={label}
        options={options}
        dropdownProps={{
          offset: 0, // Make the dropdown flush with the select element
          open,
          onOpenChange,
          ...dropdownProps
        }}
        placeholder="Select options"
        Input={Input}
        {...propsRest}
        aria-disabled={true}
        readOnly={true}
        inputProps={{
          ...propsRest.inputProps,
          className: cx(cl['bk-select-multi__input'], propsRest.inputProps?.className),
        }}
        containerProps={{
          ...propsRest.containerProps,
          className: cx(cl['bk-select-multi'], { [cl['bk-select-multi--open']]: open }, propsRest.containerProps?.className),
        }}
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
      />
    );
  },
  {
    Static: MenuMultiProvider.Static,
    Option: MenuMultiProvider.Option,
    Header: MenuMultiProvider.Header,
    Action: MenuMultiProvider.Action,
    FooterActions: MenuMultiProvider.FooterActions,
  },
);
