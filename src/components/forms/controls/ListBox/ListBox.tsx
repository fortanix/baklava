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
  ListBoxContext,
  useListBoxContext,
  useListBox,
  useListBoxItem,
  useListBoxItemFocus,
  useListBoxItemSelection,
} from './ListBoxStore.tsx';

import cl from './ListBox.module.scss';


/*
References:
- https://www.w3.org/WAI/ARIA/apg/patterns/listbox
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
- https://react-spectrum.adobe.com/react-spectrum/ListBox.html
*/

export { type ItemKey, type ItemDef, ListBoxContext, useListBoxItem };
export { cl as ListBoxClassNames };


//
// Option item
//

export type OptionProps = ComponentProps<typeof Button> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
  
  /** Explicit position of this item in the list (e.g. for virtualization). */
  itemPos?: undefined | number,
  
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
  const { itemKey, itemPos, label, icon, onSelect, requireIntent = false, ...propsRest } = props;
  
  const itemRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const itemDef = React.useMemo<ItemDef>(() => ({ itemKey, itemRef, itemPos }), [itemKey, itemPos]);
  
  const hasHover = React.useRef<boolean>(false);
  
  useListBoxItem(itemDef);
  const { isFocused, requestFocus } = useListBoxItemFocus(itemKey);
  const { isSelected, requestSelection } = useListBoxItemSelection(itemKey);
  
  React.useEffect(() => {
    if (isFocused) {
      itemRef.current?.focus();
    }
  }, [isFocused]);
  
  /*
  React.useEffect(() => {
    // Note: we should not auto-select if the focus is due to hover, only if it's through keyboard interactions
    if (!requireIntent && isFocused && !isSelected && !hasHover.current) {
      context.selectItem(itemKey);
    }
  }, [requireIntent, context.selectItem, itemKey, isFocused, isSelected]);
  
  // Focus the item when the user hovers over
  const handleMouseOver = React.useCallback(() => {
    hasHover.current = true;
    context.focusItem(itemKey);
  }, [context.focusItem, itemKey]);
  const handleMouseOut = React.useCallback(() => {
    hasHover.current = false;
    context.focusItem(null);
  }, [context.focusItem]);
  */
  
  return (
    <Button unstyled
      //id={`${context.id}_option_${itemKey}`}
      ref={itemRef}
      // biome-ignore lint/a11y/useSemanticElements: Cannot (yet) use `<option>` for this.
      role="option"
      tabIndex={isFocused ? 0 : -1} // Roving tabindex
      data-item-key={itemKey}
      aria-label={label}
      aria-selected={isSelected}
      aria-posinset={itemPos}
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--option'],
        //{ [cl['bk-list-box__item--focused']]: isFocused },
        propsRest.className,
      )}
      // onMouseOver={handleMouseOver}
      // onMouseOut={handleMouseOut}
      onPress={() => { requestSelection(); onSelect?.(); }}
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
      tabIndex={-1}
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
  const itemDef = React.useMemo<ItemDef>(() => ({ itemKey, itemRef, itemPos }), [itemKey, itemPos]);
  
  useListBoxItem(itemDef);
  const { isFocused, requestFocus } = useListBoxItemFocus(itemKey);
  
  React.useEffect(() => {
    if (isFocused) {
      itemRef.current?.focus();
    }
  }, [isFocused]);
  
  return (
    <Button unstyled
      //id={`${context.id}_action_${itemKey}`}
      ref={itemRef}
      tabIndex={isFocused ? 0 : -1} // Roving tabindex
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
  
  /** The ID of the `<form>` element to associate this list box with. Optional. */
  form?: undefined | string,
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
  
  /** If the list is virtualized, this should be set with the ordered list of all the item keys. */
  virtualItemKeys?: undefined | Array<ItemKey>,
};

type HiddenSelectedStateProps = Pick<ListBoxProps, 'name' | 'form' | 'inputProps'>;
/** Hidden input, so that this component can be connected to a <form> element. */
const HiddenSelectedState = ({ name, form, inputProps }: HiddenSelectedStateProps) => {
  const selectedItem = useListBoxContext(s => s.selectedItem);
  const onChange = React.useCallback(() => {}, []);
  return (
    <input type="hidden" name={name} form={form} {...inputProps} value={selectedItem ?? ''} onChange={onChange}/>
  );
};

/**
 * A list of items, where each item is either an option that can be selected, or an action that can be activated.
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
      form,
      inputProps,
      virtualItemKeys,
      ...propsRest
    } = props;
    
    const ref = React.useRef<HTMLDivElement>(null);
    const id = React.useId();
    
    /*
    NOTE: be careful not to use `useStore` or any other hook that would cause a re-render when the store is updated.
    This would cause all items in the list to re-render unnecessarily. Instead, you can:
      - Separate logic out to a separate component (as in `HiddenSelectedState`).
      - Use `listBox.store.subscribe` for side effects.
    */
    const listBox = useListBox(ref, {
      id: props.id ?? id,
      selectedItem: defaultSelected ?? null,
      virtualItemKeys,
    });
    
    React.useEffect(() => {
      return listBox.store.subscribe((state, prevState) => {
        if (state.selectedItem !== prevState.selectedItem && state.selectedItem !== null) {
          onSelect?.(state.selectedItem);
        }
      });
    }, [listBox.store, onSelect]);
    
    return (
      <listBox.Provider>
        <div
          // biome-ignore lint/a11y/useSemanticElements: Customizable `<select>` does not yet have browser support.
          role="listbox"
          tabIndex={-1} // Use a roving tabindex (https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface)
          aria-label={label}
          data-empty-placeholder="No items"
          {...propsRest}
          {...listBox.props}
          ref={mergeRefs(listBox.props.ref, props.ref)}
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
