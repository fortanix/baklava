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
  // type ItemDef,
  // type ItemDetails,
  // type ItemWithKey,
  // type VirtualItemKeys,
  useListBoxSelector,
  useListBox,
  useListBoxItem,
} from '../../../util/collections/ListBoxMultiStore.ts';

import cl from './ListBoxMulti.module.scss';


/*
References:
- https://www.w3.org/WAI/ARIA/apg/patterns/listbox
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
- https://react-spectrum.adobe.com/react-spectrum/ListBox.html
- https://www.radix-ui.com/primitives/docs/components/select
*/

export { type ItemKey, useListBoxItem };
export { cl as ListBoxClassNames };


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
// Group
//

export type GroupProps = React.ComponentProps<typeof MenuList.Group> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
};
/**
 * A group element that can contain list options or other groups.
 */
export const Group = (props: GroupProps) => {
  const { unstyled, ...propsRest } = props;
  
  return (
    <MenuList.Group
      unstyled={unstyled}
      {...propsRest}
      className={cx(
        { [cl['bk-list-box__group']]: !unstyled },
        propsRest.className,
      )}
    />
  );
};


//
// Static item
//

/**
 * A static item, that can be customized for any presentational content (not affected by store state).
 * 
 * Important: since this is inside a `role="listbox"`, the static content should be presentational only. There should
 * be no interactive elements or other semantic content, only presentational content.
 */
export const ItemStatic = ({ unstyled, ...propsRest }: React.ComponentProps<typeof MenuList.Static>) => (
  <MenuList.Static
    {...propsRest}
    className={cx({ [cl['bk-list-box__item']]: !unstyled }, propsRest.className)}
  />
);


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
  const { selected, requestSelected: onRequestSelected, props: itemProps } = useListBoxItem({ itemKey });
  
  return (
    <MenuList.Option
      unstyled={unstyled}
      selectionMode="multiple"
      {...mergeProps(
        itemProps,
        { selected, onRequestSelected },
        propsRest,
        { className: cx({ [cl['bk-list-box__item']]: !unstyled }, className) },
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
  const selectedItemKeys = useListBoxSelector(s => s.selectedItemKeys);
  
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

type SelectedStateProps = (
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
type PropsOmit = 'ref' | keyof SelectedStateProps;
export type ListBoxMultiProps = Omit<React.ComponentProps<typeof MenuList>, PropsOmit> & SelectedStateProps & {
  /** A React ref to pass to the list box element. */
  ref?: undefined | React.Ref<null | ListBoxRef>,
  
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
 * A list box is a composite control, consisting of a (flat) list of items. Each item can be either an option that can
 * be selected, or an action that can be activated. The items list may be partial, in case of virtualization (see
 * also `ListBoxLazy`). In this case, the `itemKeys` prop must be provided so that the list box can determine the
 * identity and ordering of the full list.
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
    
    const listBoxRef = React.useRef<ListBoxRef>(null);
    
    /*
    Set up the list box store.
    
    NOTE: try to avoid the use of `useStore` or other hooks that would cause a re-render when the store is updated.
    This would cause all items in the list to re-render unnecessarily. Instead, you can:
      - Separate logic out to a separate component (like we did for `HiddenSelectedState`).
      - Use `listBox.store.subscribe` for side effects.
    */
    const { store, ...listBoxStore } = useListBox<HTMLDivElement>({
      state: selected,
      defaultState: defaultSelected,
      defaultStateFallback: new Set(),
      onStateChange: onSelectedChange ?? onSelect,
    });
    const isEmpty = useStore(store, state => state.getItemKeys().size === 0); // Re-render is acceptable here
    
    // Note: needs the explicit generics since `Ref<T>` has some special handling of `null` that messes with inference
    React.useImperativeHandle<null | ListBoxRef, null | ListBoxRef>(ref, () => {
      const listBoxElement = listBoxRef.current;
      if (listBoxElement === null) { return null; }
      return Object.assign(listBoxElement, {
        _bkListBoxFocusFirst: () => { store.getState().focusItemAt('first'); },
        _bkListBoxFocusLast: () => { store.getState().focusItemAt('last'); },
      });
    }, [store]);
    
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
            listBoxStore.props,
            {
              status: isLoading === true ? 'loading' : undefined,
              onKeyDown: handleKeyDown,
              className: cx({ [cl['bk-list-box']]: !unstyled }),
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
    Group,
    Static: ItemStatic,
    Option: ItemOption,
  },
);
