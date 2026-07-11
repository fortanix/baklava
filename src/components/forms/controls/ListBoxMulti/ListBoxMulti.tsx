/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../../util/reactUtil.ts';
import { classNames as cx } from '../../../../util/componentUtil.ts';
import { useStore } from 'zustand';

import { MenuList } from '../../../actions/MenuList/MenuList.tsx';

import {
  type ItemKey,
  type SelectedState,
  useListBoxMultiSelector,
  useListBoxMulti,
  useListBoxMultiItem,
} from '../../../util/collections/ListBoxMultiStore.ts';

import cl from './ListBoxMulti.module.scss';


/*
References:
- https://www.w3.org/WAI/ARIA/apg/patterns/listbox
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
- https://react-spectrum.adobe.com/react-spectrum/ListBox.html
- https://www.radix-ui.com/primitives/docs/components/select
*/

export { type ItemKey, type SelectedState, useListBoxMultiItem, useListBoxMultiSelector };
export { cl as ListBoxMultiClassNames };

export type SelectedStateProps = (
  | {
    selected?: undefined, // Uncontrolled
    defaultSelected?: undefined | SelectedState,
    onSelectedChange?: undefined | ((selected: SelectedState) => void),
  }
  | {
    selected: SelectedState, // Controlled
    defaultSelected?: undefined,
    onSelectedChange: (selected: SelectedState) => void,
  }
);


//
// ListBoxRef
//

export interface ListBoxRef extends HTMLDivElement {
  _bkListBoxFocusFirst: () => void,
  _bkListBoxFocusLast: () => void,
  // TODO:
  //_bkListBoxSelectNone: () => void,
  //_bkListBoxSelectAll: () => void,
};


//
// Option item
//

type ItemOptionProps = Omit<React.ComponentProps<typeof MenuList.Option>, 'selectionMode'> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
};
/**
 * A list box option (can be selected by the user).
 */
export const ItemOption = React.memo((props: ItemOptionProps) => {
  // Note: use `memo()` so that children don't rerendered on state change, in the case that:
  // - The consumer uses this component with controlled state
  // - The `children` prop on consumer side is not memoized/static (usually the case)
  
  const { unstyled, itemKey, className, iconDecoration, ...propsRest } = props;
  const { selected, requestSelected: onRequestSelected, props: itemProps } = useListBoxMultiItem({ itemKey });
  
  return (
    <MenuList.Option
      unstyled={unstyled}
      selectionMode="multiple"
      {...mergeProps(
        itemProps,
        { selected, onRequestSelected },
        propsRest,
        { className: cx({ [cl['bk-list-box-multi__item']]: !unstyled }, className) },
      )}
    />
  );
});


//
// List box
//

type HiddenSelectedStateProps = Omit<React.ComponentProps<'input'>, 'value' | 'defaultValue' | 'onChange'>;
/** Hidden input, so that this component can be connected to a <form> element. */
const HiddenSelectedState = ({ ref, name, form, ...inputProps }: HiddenSelectedStateProps) => {
  const selectedItemKeys = useListBoxMultiSelector(s => s.selectedItemKeys);
  
  if (selectedItemKeys.size === 0) {
    // When there is no selected item, we will still render the input (so that we can get the `input.form`
    // association), but we will leave the `name` blank. This way, form submit handlers can distinguish between
    // "no selected" and "selected an item with key = empty string".
    return (
      <input
        ref={ref}
        name={undefined}
        form={form}
        type="hidden"
        {...inputProps}
        value=""
        defaultValue={undefined}
        onChange={undefined}
      />
    );
  }
  
  return Array.from(selectedItemKeys).map(itemKey =>
    <input
      key={itemKey}
      ref={ref}
      name={`${name}[]`}
      form={form}
      type="hidden"
      {...inputProps}
      value={itemKey}
      defaultValue={undefined}
      onChange={undefined}
    />
  );
};


type PropsOmit = 'ref' | keyof SelectedStateProps;
export type ListBoxMultiProps = Omit<React.ComponentProps<typeof MenuList>, PropsOmit> & SelectedStateProps & {
  /** A React ref to pass to the list box element. */
  ref?: undefined | React.Ref<ListBoxRef>,
  
  /** The machine readable name of the list box control, used as part of `<form>` submission. */
  name?: undefined | string,
  
  /** The ID of the `<form>` element to associate this list box with. Optional. */
  form?: undefined | string,
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | HiddenSelectedStateProps,
  
  /** Render the given item key as a string label. If not given, will use the item element's text value. */
  formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
  
  /** Legacy alias for `onSelectedChange`, for backwards compatbility. @deprecated */
  onSelect?: undefined | ((selected: SelectedState) => void),
  
  /** Legacy alias for `status="loading"`, for backwards compatbility. @deprecated */
  isLoading?: undefined | boolean,
};
/**
 * A multiple-select list box. Presents a (linear) list of options, out of which the user can select zero or more. Can
 * be associated with a form through the `name` prop. Each option that is selected will appear in the form data under
 * the name `${name}[]`, and with the value equal to the item key of the selected option.
 */
export const ListBoxMulti = Object.assign(
  (props: ListBoxMultiProps) => {
    const {
      ref,
      children,
      unstyled,
      selected,
      defaultSelected,
      onSelectedChange,
      name,
      form,
      inputProps,
      formatItemLabel,
      onSelect,
      isLoading,
      ...propsRest
    } = props;
    
    /*
    Set up the list box store.
    
    NOTE: try to avoid the use of `useStore` or other hooks that would cause a re-render when the store is updated.
    This would cause all items in the list to re-render unnecessarily. Instead, you can:
      - Separate logic out to a separate component (like we did for `HiddenSelectedState`).
      - Use `listBox.store.subscribe` for side effects.
    */
    const { store, ...listBoxStore } = useListBoxMulti<HTMLDivElement>({
      state: selected,
      defaultState: defaultSelected,
      defaultStateFallback: new Set(),
      onStateChange: onSelectedChange ?? onSelect,
    });
    const isEmpty = useStore(store, state => state.collectionIsEmpty()); // Re-render is considered acceptable here
    
    const listBoxRef = React.useRef<React.ComponentRef<typeof MenuList>>(null);
    const getOptionNodes = useStore(store, state => state.collectionNodeList);
    // Note: needs the explicit generics since `Ref<T>` has some special handling of `null` that messes with inference
    React.useImperativeHandle<null | ListBoxRef, null | ListBoxRef>(ref, () => {
      const listBoxElement = listBoxRef.current;
      if (!listBoxElement) { return null; }
      
      return Object.assign(listBoxElement, {
        _bkListBoxFocusFirst: () => {
          const options = getOptionNodes();
          const optionLast = options.item(0);
          if (!(optionLast instanceof HTMLElement)) { return; }
          optionLast.focus();
        },
        _bkListBoxFocusLast: () => {
          const options = getOptionNodes();
          const optionLast = options.item(options.length - 1);
          if (!(optionLast instanceof HTMLElement)) { return; }
          optionLast.focus();
        },
      });
    }, [getOptionNodes]);
    
    /* formatItemKeys
    React.useEffect(() => {
      return store.subscribe((state, prevState) => {
        if (state.selectedItem !== prevState.selectedItem && state.selectedItem !== null) {
          const itemKeys = state.selectedItem;
          const label: string = formatItemLabel?.(itemKeys)
            ?? state._internalItemsRegistry.get(itemKeys)?.itemRef.current?.textContent
            ?? itemKeys;
          const selectedItem: null | ItemDetails = state.selectedItem === null ? null : {
            itemKeys,
            label,
          };
          
          onSelect?.(itemKeys, selectedItem);
        }
      });
    }, [store, onSelect, formatItemLabel]);
    */
    
    // Delegate 'Enter' key to the hidden input for form submissions
    const hiddenInputRef = React.useRef<React.ComponentRef<typeof HiddenSelectedState>>(null);
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        const form = hiddenInputRef.current?.form;
        if (form) {
          // Submit the form (after a timeout to allow the `<input>` to be updated in response to the Enter key event)
          window.setTimeout(form.requestSubmit.bind(form), 0);
        }
      }
    }, []);
    
    return (
      <listBoxStore.Provider value={listBoxStore.context}>
        <MenuList
          role="listbox"
          aria-multiselectable="true"
          unstyled={unstyled}
          {...mergeProps(
            { ref: listBoxRef },
            listBoxStore.props,
            {
              status: isLoading === true ? 'loading' : undefined,
              onKeyDown: handleKeyDown,
              className: cx({ [cl['bk-list-box-multi']]: !unstyled }),
            },
            propsRest,
          )}
          empty={isEmpty}
        >
          {typeof name === 'string' &&
            <HiddenSelectedState ref={hiddenInputRef} form={form} name={name} {...inputProps}/>
          }
          {children}
        </MenuList>
      </listBoxStore.Provider>
    );
  },
  {
    Segment: MenuList.Segment,
    Group: MenuList.Group,
    Static: MenuList.Static,
    Option: ItemOption,
  },
);
