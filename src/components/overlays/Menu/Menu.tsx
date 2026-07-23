/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../util/reactUtil.ts';
import { classNames as cx } from '../../../util/componentUtil.ts';

import { useStore } from 'zustand';
import { type ItemKey, useCollection, useCollectionItem } from '../../util/collections/CollectionStore.ts';
// FIXME: we're using the ListBox stores here, but technically we're not using them for `role="listbox"` components.
import {
  type SelectedState as SelectedSingleState,
  useListBox,
  useListBoxItem,
} from '../../util/collections/ListBoxStore.ts';
import {
  type SelectedState as SelectedMultiState,
  useListBoxMulti,
  useListBoxMultiItem,
} from '../../util/collections/ListBoxMultiStore.ts';

import { MenuList } from '../../actions/MenuList/MenuList.tsx';

import cl from './Menu.module.scss';


export { cl as MenuClassNames };
export type { ItemKey, SelectedSingleState, SelectedMultiState };

const subcomponentsGeneric = {
  Segment: MenuList.Segment,
  Footer: MenuList.Footer,
  Group: MenuList.Group,
  Static: MenuList.Static,
  Action: MenuList.Action,
  Link: MenuList.Link,
} as const;


interface MenuRef extends React.ComponentRef<typeof MenuList> {
  _bkCollectionFocusFirst: () => void,
  _bkCollectionFocusLast: () => void,
};
interface MenuGroupRef extends React.ComponentRef<typeof MenuList.Group> {
  _bkCollectionFocusFirst: () => void,
  _bkCollectionFocusLast: () => void,
};


//
// Menu actions
//

type MenuActionProps = React.ComponentProps<typeof MenuList.Action> & {
  /** A unique identifier for this action. */
  itemKey: ItemKey,
};
/** A menu item that triggers some arbitrary action. */
export const MenuAction = ({ itemKey, ...propsRest }: MenuActionProps) => {
  const { props: itemProps } = useCollectionItem({ itemKey });
  return (
    <MenuList.Action
      {...mergeProps(itemProps, propsRest, { className: cx({ [cl['bk-menu__item']]: !propsRest.unstyled }) })}
    />
  );
};

type MenuLinkProps = React.ComponentProps<typeof MenuList.Link> & {
  /** A unique identifier for this link. */
  itemKey: ItemKey,
};
/** A menu item that triggers a navigation. */
export const MenuLink = ({ itemKey, ...propsRest }: MenuLinkProps) => {
  const { props: itemProps } = useCollectionItem({ itemKey });
  return (
    <MenuList.Link
      {...mergeProps(itemProps, propsRest, { className: cx({ [cl['bk-menu__item']]: !propsRest.unstyled }) })}
    />
  );
};


//
// MenuSelect
//

type MenuSelectStateProps = {
  selected?: undefined | SelectedSingleState,
  defaultSelected?: undefined | SelectedSingleState,
  onSelectedChange?: undefined | ((selected: SelectedSingleState) => void),
};
type MenuSelectOptionProps = Omit<React.ComponentProps<typeof MenuList.Option>, 'selectionMode'> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
};
const MenuSelectOption = ({ itemKey, ...propsRest }: MenuSelectOptionProps) => {
  const { selected, requestSelected, props: itemProps } = useListBoxItem({ itemKey });
  return (
    <MenuList.Option
      {...mergeProps(
        itemProps,
        { selected, onRequestSelected: requestSelected },
        propsRest,
        { className: cx({ [cl['bk-menu-select__item']]: !propsRest.unstyled }) },
      )}
      selectionMode="single"
    />
  );
};

type MenuSelectPropsBase = Omit<
  React.ComponentProps<typeof MenuList.Group>, 'ref' | 'label' | keyof MenuSelectStateProps
>;
type MenuSelectProps = MenuSelectPropsBase & MenuSelectStateProps & {
  /** A React ref to pass to the menu element. */
  ref?: undefined | React.Ref<MenuGroupRef>,
  
  /** A unique identifier for this option. */
  itemKey: ItemKey,
  
  /** Render the given item key as a string label. If not given, will use the item element's text value. */
  formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
};
export const MenuSelect = Object.assign(
  (props: MenuSelectProps) => {
    const {
      ref,
      itemKey,
      selected,
      defaultSelected,
      onSelectedChange,
      formatItemLabel,
      ...propsRest
    } = props;
    
    const { props: itemProps } = useCollectionItem({ itemKey });
    
    const { store, ...listBoxStore } = useListBox<React.ComponentRef<typeof MenuList>>({
      state: selected,
      defaultState: defaultSelected,
      defaultStateFallback: null,
      onStateChange: onSelectedChange,
    });
    const isEmpty = useStore(store, state => state.collectionIsEmpty()); // Re-render is considered acceptable here
    
    const menuRef = React.useRef<React.ComponentRef<typeof MenuList>>(null);
    const collectionFocusItemAt = useStore(store, state => state.collectionFocusItemAt);
    // Note: needs the explicit generics since `Ref<T>` has some special handling of `null` that messes with inference
    React.useImperativeHandle<null | MenuGroupRef, null | MenuGroupRef>(ref, () => {
      const listBoxElement = menuRef.current;
      if (!listBoxElement) { return null; }
      
      return Object.assign(listBoxElement, {
        _bkCollectionFocusFirst: () => { collectionFocusItemAt('first'); },
        _bkCollectionFocusLast: () => { collectionFocusItemAt('last'); },
      });
    }, [collectionFocusItemAt]);
    
    return (
      <listBoxStore.Provider value={listBoxStore.context}>
        <MenuList.Group
          //heading="Test" // FIXME
          //role="group" // FIXME
          //aria-multiselectable="false" // Note: not applicable to `role="menu"`
          {...mergeProps(
            { ref: menuRef },
            itemProps,
            listBoxStore.props,
            { className: cx({ [cl['bk-menu-select']]: !propsRest.unstyled }) },
            propsRest,
          )}
          empty={isEmpty}
        />
      </listBoxStore.Provider>
    );
  },
  {
    ...subcomponentsGeneric,
    Option: MenuSelectOption,
  },
);

//
// MenuSelectMulti
//

type MenuSelectMultiStateProps = {
  selected?: undefined | SelectedMultiState,
  defaultSelected?: undefined | SelectedMultiState,
  onSelectedChange?: undefined | ((selected: SelectedMultiState) => void),
};
type MenuSelectMultiOptionProps = Omit<React.ComponentProps<typeof MenuList.Option>, 'selectionMode'> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
};
const MenuSelectMultiOption = React.memo(({ itemKey, ...propsRest }: MenuSelectMultiOptionProps) => {
  const { selected, requestSelected, props: itemProps } = useListBoxMultiItem({ itemKey });
  return (
    <MenuList.Option
      {...mergeProps(
        itemProps,
        { selected, onRequestSelected: requestSelected },
        propsRest,
        { className: cx({ [cl['bk-menu-select-multi__item']]: !propsRest.unstyled }) },
      )}
      selectionMode="multiple"
    />
  );
});

type MenuSelectMultiPropsBase = Omit<
  React.ComponentProps<typeof MenuList>, 'ref' | 'label' | keyof MenuSelectMultiStateProps
>;
export type MenuSelectMultiProps = MenuSelectMultiPropsBase & MenuSelectMultiStateProps & {
  /** A React ref to pass to the menu element. */
  ref?: undefined | React.Ref<MenuGroupRef>,
  
  /** A unique identifier for this group. */
  itemKey: ItemKey,
  
  /** Render the given item key as a string label. If not given, will use the item element's text value. */
  formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
};
export const MenuSelectMulti = Object.assign(
  (props: MenuSelectMultiProps) => {
    const {
      ref,
      itemKey,
      selected,
      defaultSelected,
      onSelectedChange,
      formatItemLabel,
      ...propsRest
    } = props;
    
    const { props: itemProps } = useCollectionItem({ itemKey });
    
    const { store, ...listBoxStore } = useListBoxMulti<React.ComponentRef<typeof MenuList>>({
      state: selected,
      defaultState: defaultSelected,
      defaultStateFallback: new Set(),
      onStateChange: onSelectedChange,
    });
    const isEmpty = useStore(store, state => state.collectionIsEmpty()); // Re-render is considered acceptable here
    
    const menuRef = React.useRef<React.ComponentRef<typeof MenuList>>(null);
    const collectionFocusItemAt = useStore(store, state => state.collectionFocusItemAt);
    // Note: needs the explicit generics since `Ref<T>` has some special handling of `null` that messes with inference
    React.useImperativeHandle<null | MenuGroupRef, null | MenuGroupRef>(ref, () => {
      const listBoxElement = menuRef.current;
      if (!listBoxElement) { return null; }
      
      return Object.assign(listBoxElement, {
        _bkCollectionFocusFirst: () => { collectionFocusItemAt('first'); },
        _bkCollectionFocusLast: () => { collectionFocusItemAt('last'); },
      });
    }, [collectionFocusItemAt]);
    
    return (
      <listBoxStore.Provider value={listBoxStore.context}>
        <MenuList.Group
          //embedded
          //role="group"
          //aria-multiselectable="true" // Note: not applicable to `role="menu"`
          {...mergeProps(
            { ref: menuRef },
            itemProps,
            listBoxStore.props,
            { className: cx({ [cl['bk-menu-select-multi']]: !propsRest.unstyled }) },
            propsRest,
          )}
          //empty={isEmpty} // FIXME: add this for MenuList.Group?
        />
      </listBoxStore.Provider>
    );
  },
  {
    ...subcomponentsGeneric,
    Option: MenuSelectMultiOption,
  },
);


//
// Menu
//

export type MenuProps = Omit<React.ComponentProps<typeof MenuList>, 'ref'> & {
  /** A React ref to pass to the menu element. */
  ref?: undefined | React.Ref<MenuRef>,
};
/**
 * A menu component. Presents a list of items to the user, which can be either actions (may trigger something, for
 * instance to open a submenu), or options that can be selected (either single or multiple selection). Groups can be
 * nested inside, which can be generic groups or nested single/multi-select option groups, which have their own
 * state separate from the rest of the menu.
 * 
 * Corresponds to the ARIA `menu` role by default, or also allows `role="menubar"`.
 */
export const Menu = Object.assign(
  ({ ref, ...propsRest }: MenuProps) => {
    const { store, ...collectionStore } = useCollection<React.ComponentRef<typeof MenuList>>();
    
    //const isEmpty = useStore(store, state => state.collectionIsEmpty());
    
    const menuRef = React.useRef<React.ComponentRef<typeof MenuList>>(null);
    const collectionFocusItemAt = useStore(store, state => state.collectionFocusItemAt);
    // Note: needs the explicit generics since `Ref<T>` has some special handling of `null` that messes with inference
    React.useImperativeHandle<null | MenuRef, null | MenuRef>(ref, () => {
      const menuElement = menuRef.current;
      if (!menuElement) { return null; }
      
      return Object.assign(menuElement, {
        _bkCollectionFocusFirst: () => { collectionFocusItemAt('first'); },
        _bkCollectionFocusLast: () => { collectionFocusItemAt('last'); },
      });
    }, [collectionFocusItemAt]);
    
    return (
      <collectionStore.Provider value={collectionStore.context}>
        <MenuList
          role="menu"
          {...mergeProps(
            { ref: menuRef },
            collectionStore.props,
            { className: cx({ [cl['bk-menu']]: !propsRest.unstyled }) },
            propsRest,
          )}
          // Note: this won't work, since we don't know whether there are any groups in this list. Leave the logic to
          // the default MenuList: empty is true if consumer explicitly sets it, or `children` is undefined.
          //empty={isEmpty}
        />
      </collectionStore.Provider>
    );
  },
  {
    ...subcomponentsGeneric,
    Select: MenuSelect,
    SelectMulti: MenuSelectMulti,
  },
);
