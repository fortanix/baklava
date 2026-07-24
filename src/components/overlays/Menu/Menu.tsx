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
  Static: MenuList.Static,
} as const;


interface MenuRef extends React.ComponentRef<typeof MenuList> {
  _bkFocusFirst: () => void,
  _bkFocusLast: () => void,
};

type MenuSelectStateProps = {
  selected?: undefined | SelectedSingleState,
  defaultSelected?: undefined | SelectedSingleState,
  onSelectedChange?: undefined | ((selected: SelectedSingleState) => void),
};
type MenuSelectMultiStateProps = {
  selected?: undefined | SelectedMultiState,
  defaultSelected?: undefined | SelectedMultiState,
  onSelectedChange?: undefined | ((selected: SelectedMultiState) => void),
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
      {...mergeProps(itemProps, propsRest, { className: cl['bk-menu__item'] })}
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
      {...mergeProps(itemProps, propsRest, { className: cl['bk-menu__item'] })}
    />
  );
};


//
// MenuGroup
//

export type MenuGroupProps = React.ComponentProps<typeof MenuList.Group> & {
  /** A unique identifier for this group. */
  itemKey: ItemKey,
};
export const MenuGroup = ({ itemKey, ...propsRest }: MenuGroupProps) => {
  const { props: itemProps } = useCollectionItem({ itemKey });
  
  // Groups create their own nested collections
  const { collectionId, store, ...collectionStore } = useCollection<React.ComponentRef<typeof MenuList>>();
  const isEmpty = useStore(store, state => state.collectionIsEmpty()); // Re-render is considered acceptable here
  
  // Note: groups for differently for menu than for listbox. In a listbox, the groups are just semantic groupings
  // but they don't affect state. For example, a single-select listbox will always have one selected item at the top
  // level, even if there are groups. In menu, each group has its own state. If there are two menu groups, and each
  // has items with role `menuitemradio`, then each group has its own separate selected item.
  // In `Menu`, we also model it so that we have one collection store per `Group`.
  
  return (
    <collectionStore.Provider value={collectionStore.context}>
      <MenuList.Group
        {...mergeProps(
          itemProps,
          { className: cx(cl['bk-menu__item'], { [cl['bk-menu__group']]: !propsRest.unstyled }) },
          propsRest,
        )}
        empty={isEmpty}
      />
    </collectionStore.Provider>
  );
};


//
// MenuGroupSelect
//

type MenuSelectOptionProps = Omit<React.ComponentProps<typeof MenuList.Option>, 'selectionMode'> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
};
const MenuSelectOption = ({ itemKey, ...propsRest }: MenuSelectOptionProps) => {
  const { props: collectionProps } = useCollectionItem({ itemKey });
  const { selected, requestSelected, props: itemProps } = useListBoxItem({ itemKey });
  return (
    <MenuList.Option
      {...mergeProps(
        collectionProps,
        itemProps,
        { selected, onRequestSelected: requestSelected },
        propsRest,
        { className: cl['bk-menu__item'] },
      )}
      selectionMode="single"
    />
  );
};

type MenuGroupSelectPropsBase = Omit<React.ComponentProps<typeof MenuList.Group>, keyof MenuSelectStateProps>;
type MenuGroupSelectProps = MenuGroupSelectPropsBase & MenuSelectStateProps & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
  
  ///** Render the given item key as a string label. If not given, will use the item element's text value. */
  //formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
};
export const MenuGroupSelect = Object.assign(
  (props: MenuGroupSelectProps) => {
    const {
      itemKey,
      selected,
      defaultSelected,
      onSelectedChange,
      //formatItemLabel,
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
    
    return (
      <listBoxStore.Provider value={listBoxStore.context}>
        <MenuList.Group
          //aria-multiselectable="false" // Note: not applicable to `role="menu"`
          {...mergeProps(
            itemProps,
            listBoxStore.props,
            { className: cx(cl['bk-menu__item'], { [cl['bk-menu__group-select']]: !propsRest.unstyled }) },
            propsRest,
          )}
          empty={isEmpty}
        />
      </listBoxStore.Provider>
    );
  },
  {
    ...subcomponentsGeneric,
    Action: MenuAction,
    Link: MenuLink,
    Group: MenuGroup,
    Option: MenuSelectOption,
  },
);


//
// MenuGroupSelectMulti
//

type MenuSelectMultiOptionProps = Omit<React.ComponentProps<typeof MenuList.Option>, 'selectionMode'> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
};
const MenuSelectMultiOption = React.memo(({ itemKey, ...propsRest }: MenuSelectMultiOptionProps) => {
  const { props: collectionProps } = useCollectionItem({ itemKey });
  const { selected, requestSelected, props: itemProps } = useListBoxMultiItem({ itemKey });
  return (
    <MenuList.Option
      {...mergeProps(
        collectionProps,
        itemProps,
        { selected, onRequestSelected: requestSelected },
        propsRest,
        { className: cl['bk-menu__item'] },
      )}
      selectionMode="multiple"
    />
  );
});

type MenuGroupSelectMultiPropsBase = Omit<React.ComponentProps<typeof MenuList>, keyof MenuSelectMultiStateProps>;
export type MenuGroupSelectMultiProps = MenuGroupSelectMultiPropsBase & MenuSelectMultiStateProps & {
  /** A unique identifier for this group. */
  itemKey: ItemKey,
  
  ///** Render the given item key as a string label. If not given, will use the item element's text value. */
  //formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
};
export const MenuGroupSelectMulti = Object.assign(
  (props: MenuGroupSelectMultiProps) => {
    const {
      ref,
      itemKey,
      selected,
      defaultSelected,
      onSelectedChange,
      //formatItemLabel,
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
    
    return (
      <listBoxStore.Provider value={listBoxStore.context}>
        <MenuList.Group
          //aria-multiselectable="true" // Note: not applicable to `role="menu"`
          {...mergeProps(
            itemProps,
            listBoxStore.props,
            { className: cx(cl['bk-menu__item'], { [cl['bk-menu__group-select-multi']]: !propsRest.unstyled }) },
            propsRest,
          )}
          empty={isEmpty}
        />
      </listBoxStore.Provider>
    );
  },
  {
    ...subcomponentsGeneric,
    Action: MenuAction,
    Link: MenuLink,
    Group: MenuGroup,
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
    const isEmpty = useStore(store, state => state.collectionIsEmpty()); // Re-render is considered acceptable here
    
    const menuRef = React.useRef<React.ComponentRef<typeof MenuList>>(null);
    const collectionFocusItemAt = useStore(store, state => state.collectionFocusItemAt);
    // Note: needs the explicit generics since `Ref<T>` has some special handling of `null` that messes with inference
    React.useImperativeHandle<null | MenuRef, null | MenuRef>(ref, () => {
      const menuElement = menuRef.current;
      if (!menuElement) { return null; }
      
      return Object.assign(menuElement, {
        _bkFocusFirst: () => { collectionFocusItemAt('first'); },
        _bkFocusLast: () => { collectionFocusItemAt('last'); },
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
          empty={isEmpty}
        />
      </collectionStore.Provider>
    );
  },
  {
    ...subcomponentsGeneric,
    Action: MenuAction,
    Link: MenuLink,
    Group: MenuGroup,
    GroupSelect: MenuGroupSelect,
    GroupSelectMulti: MenuGroupSelectMulti,
  },
);



//
// Specialized single/multi-select menu components (top-level)
//

type MenuSelectPropsBase = Omit<React.ComponentProps<typeof Menu>, keyof MenuSelectStateProps>;
type MenuSelectProps = MenuSelectPropsBase & MenuSelectStateProps & {
  ///** Render the given item key as a string label. If not given, will use the item element's text value. */
  //formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
};
export const MenuSelect = Object.assign(
  (props: MenuSelectProps) => {
    const {
      selected,
      defaultSelected,
      onSelectedChange,
      //formatItemLabel,
      ...propsRest
    } = props;
    
    const { store, ...listBoxStore } = useListBox<React.ComponentRef<typeof Menu>>({
      state: selected,
      defaultState: defaultSelected,
      defaultStateFallback: null,
      onStateChange: onSelectedChange,
    });
    
    return (
      <listBoxStore.Provider value={listBoxStore.context}>
        <Menu
          //aria-multiselectable="false" // Note: not applicable to `role="menu"`
          {...mergeProps(
            listBoxStore.props,
            { className: cx({ [cl['bk-menu-select']]: !propsRest.unstyled }) },
            propsRest,
          )}
        />
      </listBoxStore.Provider>
    );
  },
  {
    ...subcomponentsGeneric,
    Action: MenuAction,
    Link: MenuLink,
    Group: MenuGroup,
    Option: MenuSelectOption,
  },
);

type MenuSelectMultiPropsBase = Omit<React.ComponentProps<typeof Menu>, keyof MenuSelectMultiStateProps>;
type MenuSelectMultiProps = MenuSelectMultiPropsBase & MenuSelectMultiStateProps & {
  ///** Render the given item key as a string label. If not given, will use the item element's text value. */
  //formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
};
export const MenuSelectMulti = Object.assign(
  (props: MenuSelectMultiProps) => {
    const {
      selected,
      defaultSelected,
      onSelectedChange,
      //formatItemLabel,
      ...propsRest
    } = props;
    
    const { store, ...listBoxStore } = useListBoxMulti<React.ComponentRef<typeof Menu>>({
      state: selected,
      defaultState: defaultSelected,
      defaultStateFallback: new Set(),
      onStateChange: onSelectedChange,
    });
    
    return (
      <listBoxStore.Provider value={listBoxStore.context}>
        <Menu
          //aria-multiselectable="false" // Note: not applicable to `role="menu"`
          {...mergeProps(
            listBoxStore.props,
            { className: cx({ [cl['bk-menu-select-multi']]: !propsRest.unstyled }) },
            propsRest,
          )}
        />
      </listBoxStore.Provider>
    );
  },
  {
    ...subcomponentsGeneric,
    Action: MenuAction,
    Link: MenuLink,
    Group: MenuGroup,
    Option: MenuSelectMultiOption,
  },
);
