/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, mergeCallbacks } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import { type IconName, Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import {
  type ItemKey,
  type ItemDef,
  type ItemWithKey,
  type VirtualItemKeys,
  ListBoxContext,
  useListBoxSelector,
  useListBox,
  useListBoxItem,
} from './ListBoxStore.tsx';

import cl from './ListBox.module.scss';


/*
References:
- https://www.w3.org/WAI/ARIA/apg/patterns/listbox
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
- https://react-spectrum.adobe.com/react-spectrum/ListBox.html
- https://www.radix-ui.com/primitives/docs/components/select
*/

export { type ItemKey, type ItemDef, ListBoxContext, useListBoxItem };
export { cl as ListBoxClassNames };


//
// Option item
//

export type OptionProps = ComponentProps<typeof Button> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
  
  /** The human-readable label to be shown. */
  label: string,
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
  
  /** A callback to be called when the option is selected. */
  onSelect?: undefined | (() => void),
  
  /**
   * Whether to require explicit user intent (e.g. click) before selecting the option. When this is false, the item
   * may be selected automatically when navigating through the list by keyboard. Default: false.
   */
  requireIntent?: undefined | boolean,
};
/**
 * A list box item that can be selected.
 */
export const Option = (props: OptionProps) => {
  const { itemKey, label, icon, onSelect, requireIntent = false, ...propsRest } = props;
  
  const itemRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const itemDef = React.useMemo<ItemWithKey>(() => ({ itemKey, itemRef }), [itemKey]);
  
  const hasHover = React.useRef<boolean>(false); // Note: make sure to use ref instead of state (prevent rerenders)
  const handleMouseOver = React.useCallback(() => { hasHover.current = true; }, []);
  const handleMouseOut = React.useCallback(() => { hasHover.current = false; }, []);
  
  const { id, itemPosition, isFocused, requestFocus, isSelected, requestSelection } = useListBoxItem(itemDef);
  
  /*
  // biome-ignore lint/correctness/useExhaustiveDependencies: Needs to rerun if `itemRef.current` changes
  React.useEffect(() => {
    if (isFocused) {
      // Note: do not scroll if the focus was triggered by a mouse event
      itemRef.current?.focus({ preventScroll: hasHover.current });
    }
  }, [isFocused, itemRef.current]);
  */
  
  /*
  React.useEffect(() => {
    // Note: we should not auto-select if the focus is due to hover, only if it's through keyboard interactions
    if (!requireIntent && isFocused && !isSelected && !hasHover.current) {
      context.selectItem(itemKey);
    }
  }, [requireIntent, context.selectItem, itemKey, isFocused, isSelected]);
  */
 
  const handlePress = React.useCallback(() => { requestSelection(); onSelect?.(); }, [requestSelection, onSelect]);
  
  return (
    <Button
      unstyled
      id={id}
      ref={itemRef}
      // biome-ignore lint/a11y/useSemanticElements: Cannot (yet) use `<option>` for this.
      role="option"
      tabIndex={isFocused ? 0 : -1}
      data-item-key={itemKey}
      aria-label={label}
      aria-selected={isSelected}
      aria-posinset={itemPosition ?? undefined}
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--option'],
        //{ [cl['bk-list-box__item--focused']]: isFocused },
        propsRest.className,
      )}
      //onMouseOver={mergeCallbacks([handleMouseOver, propsRest.onMouseOver])}
      //onMouseOut={mergeCallbacks([handleMouseOut, propsRest.onMouseOut])}
      onPress={handlePress}
    >
      {icon && <Icon icon={icon} className={cl['bk-list-box__item__icon']}/>}
      <span className={cl['bk-list-box__item__label']}>{propsRest.children ?? label}</span>
    </Button>
  );
};


//
// Header item
//

export type HeaderProps = ComponentProps<typeof Button> & {
  /** A unique identifier for this item. */
  itemKey: ItemKey,
  
  /** The human-readable label to be shown. */
  label: string,
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
};
/**
 * A static text item that can be used as a heading.
 */
export const Header = (props: HeaderProps) => {
  const { itemKey, label, icon, ...propsRest } = props;
  
  return (
    <span
      //tabIndex={undefined}
      data-item-key={itemKey}
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--static'],
        cl['bk-list-box__item--header'],
        propsRest.className,
      )}
    >
      {icon && <Icon icon={icon} className={cl['bk-list-box__item__icon']}/>}
      <span className={cl['bk-list-box__item__label']}>{propsRest.children ?? label}</span>
    </span>
  );
};


//
// Action item
//

export type ActionProps = ComponentProps<typeof Button> & {
  /** A unique identifier for this action. */
  itemKey: ItemKey,
  
  /** Explicit position of this item in the list (e.g. for virtualization). */
  itemPos?: undefined | number,
  
  /** The human-readable label to be shown. */
  label: string,
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
  
  /** The event handler for when the user activates this action. */
  onActivate: () => void | Promise<void>,
  
  /** Whether the action should stick on scroll. Default: false. */
  sticky?: undefined | false | 'end',
};
/**
 * A list box item that can be activated to perform some action.
 */
export const Action = (props: ActionProps) => {
  const { itemKey, itemPos, label, icon, onActivate, sticky = false, ...propsRest } = props;
  
  const itemRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const itemDef = React.useMemo<ItemWithKey>(() => ({ itemKey, itemRef }), [itemKey]);
  
  const { id, isFocused, requestFocus } = useListBoxItem(itemDef);
  
  // React.useEffect(() => {
  //   if (isFocused) {
  //     itemRef.current?.focus();
  //   }
  // }, [isFocused]);
  
  return (
    <Button
      unstyled
      id={id}
      ref={itemRef}
      tabIndex={isFocused ? 0 : -1}
      data-item-key={itemKey}
      aria-label={label}
      aria-posinset={itemPos}
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--action'],
        //{ [cl['bk-list-box__item--focused']]: isFocused },
        { [cl['bk-list-box__item--sticky-end']]: sticky === 'end' },
        propsRest.className,
      )}
      onPress={() => { requestFocus(); onActivate?.(); }}
    >
      {icon && <Icon icon={icon} className={cl['bk-list-box__item__icon']}/>}
      <span className={cl['bk-list-box__item__label']}>{propsRest.children ?? label}</span>
    </Button>
  );
};


//
// List box
//

export type ListBoxProps = Omit<ComponentProps<'div'>, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** An accessible name for this listbox menu. Required. */
  label: string,
  
  /** The default option to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | ItemKey,

  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | ItemKey,
  
  /** Event handler to be called when the selected option state changes. */
  onSelect?: undefined | ((itemKey: ItemKey) => void),
  
  /** Whether the list box is disabled or not. Default: false. */
  disabled?: undefined | boolean,
  
  /** The machine readable name of the list box control, used as part of `<form>` submission. */
  name?: undefined | string,
  
  /** A placheholder text message to display when there are no items in the list. */
  placeholderEmpty?: undefined | string,
  
  /** The ID of the `<form>` element to associate this list box with. Optional. */
  form?: undefined | string,
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
  
  /** If the list is virtually rendered, `virtualItemKeys` should be provided with the full list of item keys. */
  virtualItemKeys: null | VirtualItemKeys,
};

type HiddenSelectedStateProps = Pick<ListBoxProps, 'name' | 'form' | 'inputProps'>;
/** Hidden input, so that this component can be connected to a <form> element. */
const HiddenSelectedState = ({ name, form, inputProps }: HiddenSelectedStateProps) => {
  const selectedItem = useListBoxSelector(s => s.selectedItem);
  const onChange = React.useCallback(() => {}, []);
  return (
    <input type="hidden" name={name} form={form} {...inputProps} value={selectedItem ?? ''} onChange={onChange}/>
  );
};

/**
 * A list box is a composite control, consisting of a (flat) list of items. Each item can be either an option that can
 * be selected, or an action that can be activated. The items list may be partial, in case of virtualization (see
 * also `ListBoxLazy`). In this case, the `itemKeys` prop must be provided so that the list box can determine the
 * identity and ordering of the full list.
 */
export const ListBox = Object.assign(
  (props: ListBoxProps) => {
    const {
      children,
      unstyled = false,
      label,
      defaultSelected,
      selected,
      onSelect,
      disabled = false,
      name,
      placeholderEmpty = 'No items',
      form,
      inputProps,
      virtualItemKeys,
      ...propsRest
    } = props;
    
    const id = React.useId();
    const ref = React.useRef<HTMLDivElement>(null);
    
    /*
    Set up the list box store.
    
    NOTE: be careful not to use `useStore` or any other hook that would cause a re-render when the store is updated.
    This would cause all items in the list to re-render unnecessarily. Instead, you can:
      - Separate logic out to a separate component (as in `HiddenSelectedState`).
      - Use `listBox.store.subscribe` for side effects.
    */
    const selectedItemKeyDefault = selected ?? defaultSelected ?? null;
    const listBox = useListBox(ref, {
      id: props.id ?? id,
      disabled,
      selectedItem: selectedItemKeyDefault,
      focusedItem: selectedItemKeyDefault,
      virtualItemKeys,
    });
    
    if (listBox.store.getState().virtualItemKeys !== virtualItemKeys) {
      listBox.store.getState().setVirtualItemKeys(virtualItemKeys);
    }
    
    React.useEffect(() => {
      return listBox.store.subscribe((state, prevState) => {
        if (state.selectedItem !== prevState.selectedItem && state.selectedItem !== null) {
          onSelect?.(state.selectedItem);
        }
      });
    }, [listBox.store, onSelect]);
    
    /*
    React.useEffect(() => {
      return listBox.store.subscribe((state, prevState) => {
        if (state.focusedItem !== prevState.focusedItem && ref.current) {
          if (state.focusedItem === null) {
            ref.current.removeAttribute('aria-activedescendant');
          } else {
            const activeDescendantId = `${id}_${state.focusedItem}`;
            ref.current.setAttribute('aria-activedescendant', activeDescendantId);
          }
        }
      });
    }, [listBox.store, id]);
    */
    
    return (
      <listBox.Provider>
        <div
          // biome-ignore lint/a11y/useSemanticElements: Customizable `<select>` does not yet have browser support.
          role="listbox"
          tabIndex={undefined} // Do not make the listbox focusable, use a roving tabindex instead
          aria-label={label}
          data-empty-placeholder={placeholderEmpty}
          {...propsRest}
          {...listBox.props}
          ref={mergeRefs(ref, props.ref)}
          onKeyDown={mergeCallbacks([listBox.props.onKeyDown, propsRest.onKeyDown])}
          className={cx(
            'bk',
            { [cl['bk-list-box']]: !unstyled },
            listBox.props.className,
            propsRest.className,
          )}
        >
          <HiddenSelectedState/>
          {children}
        </div>
      </listBox.Provider>
    );
  },
  {
    Option,
    Header,
    Action,
  },
);
