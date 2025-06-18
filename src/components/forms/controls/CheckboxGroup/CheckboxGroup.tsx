/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import * as React from 'react';

import { FieldSet } from '../../common/FieldSet/FieldSet.tsx';
import { Checkbox } from '../Checkbox/Checkbox.tsx';

import cl from './CheckboxGroup.module.scss';


export { cl as CheckboxGroupClassNames };

export type CheckboxKey = string;

export type CheckboxGroupContext = {
  name?: undefined | CheckboxKey,
  formId?: undefined | string,
  selectedItems: undefined | Set<CheckboxKey>,
  updateItem: (checkboxKey: CheckboxKey, checked: boolean) => void,
};
export const CheckboxGroupContext = React.createContext<null | CheckboxGroupContext>(null);
export const useCheckboxGroupContext = () => {
  const context = React.use(CheckboxGroupContext);
  if (context === null) { throw new Error(`Missing CheckboxGroupContext provider`); }
  return context;
};

export type CheckboxItemProps = React.ComponentProps<typeof Checkbox.Labeled> & {
  /** The unique key of this checkbox within the checkbox group. */
  checkboxKey: CheckboxKey,
};
export const CheckboxItem = ({ checkboxKey, ...propsRest }: CheckboxItemProps) => {
  const context = useCheckboxGroupContext();
  
  const checked: undefined | boolean = typeof context.selectedItems === 'undefined'
    ? undefined // Uncontrolled
    : context.selectedItems.has(checkboxKey); // Controlled
  
  const onChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    propsRest.onChange?.(event);
    context.updateItem(checkboxKey, event.target.checked);
  }, [propsRest.onChange, context.updateItem, checkboxKey]);
  
  return (
    <Checkbox.Labeled
      // Note: `<fieldset>` also has a `form` attribute, but just setting `form` on  `<fieldset>` does not affect any
      // of the descendant `<input>` elements. See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset
      form={context.formId}
      name={context.name}
      value={checkboxKey}
      checked={checked}
      onChange={typeof checked === 'undefined' ? undefined : onChange}
      {...propsRest}
    />
  );
};

export type CheckboxGroupProps = ComponentProps<typeof FieldSet> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The machine-readable name of the checkbox group, used for form data. */
  name?: undefined | string,
  
  /** The human-readable label for the checkbox group. */
  label?: undefined | React.ReactNode,
  
  /** The default checkboxes to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | Set<CheckboxKey>,
  
  /** The checkbox to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | Set<CheckboxKey>,
  
  /** Event handler which is called when the selected checkboxes changes. */
  onUpdate?: undefined | ((checkboxKeys: Set<CheckboxKey>) => void),
  
  /** The orientation of the checkboxes, either vertical or horizontal. Default: 'horizontal'. */
  orientation?: undefined | 'vertical' | 'horizontal',
  
  /** A class name to apply on the inner checkbox group (rather than the outer fieldset). */
  contentClassName?: undefined | ComponentProps<typeof FieldSet>['contentClassName'],
};

/**
 * A group of checkbox components.
 */
export const CheckboxGroup = Object.assign(
  (props: CheckboxGroupProps) => {
    const {
      unstyled,
      children,
      form,
      name,
      label,
      defaultSelected,
      selected,
      onUpdate,
      orientation = 'horizontal',
      contentClassName,
      ...propsRest
    } = props;
    
    const [selectedItems, setSelectedItems] = React.useState<undefined | Set<CheckboxKey>>(selected ?? defaultSelected);
    
    const updateItem = React.useCallback((checkboxKey: CheckboxKey, checked: boolean) => {
      setSelectedItems(selectedItems => {
        const selectedItemsUpdated = new Set(selectedItems);
        
        if (checked) {
          selectedItemsUpdated.add(checkboxKey);
        } else {
          selectedItemsUpdated.delete(checkboxKey);
        }
        
        onUpdate?.(selectedItemsUpdated);
        return selectedItemsUpdated;
      });
    }, [onUpdate]);
    
    const context = React.useMemo<CheckboxGroupContext>(() => ({
      name,
      formId: form,
      selectedItems,
      updateItem,
    }), [name, form, selectedItems, updateItem]);
    
    return (
      <CheckboxGroupContext value={context}>
        <FieldSet
          legend={label}
          //role="group" // Note: already the default (and no other suitable `role` for checkbox group exists)
          aria-orientation={orientation}
          {...propsRest}
          className={cx(
            'bk',
            cl['bk-checkbox-group'],
            { [cl['bk-checkbox-group--horizontal']]: orientation === 'horizontal' },
            { [cl['bk-checkbox-group--vertical']]: orientation === 'vertical' },
            propsRest.className,
          )}
          contentClassName={cx(cl['bk-checkbox-group__content'], contentClassName)}
        >
          {children}
        </FieldSet>
      </CheckboxGroupContext>
    );
  },
  {
    Checkbox: CheckboxItem,
  },
);
