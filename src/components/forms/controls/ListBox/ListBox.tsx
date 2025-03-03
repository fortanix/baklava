/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { isItemProgrammaticallyFocusable } from '../../../util/composition/compositionUtil.ts';

import { type IconName, Icon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import cl from './ListBox.module.scss';
import { mergeCallbacks } from '../../../../util/reactUtil.ts';


/*
References:
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
- https://react-spectrum.adobe.com/react-spectrum/ListBox.html
*/

export { cl as ListBoxClassNames };


// https://stackoverflow.com/questions/11815883/convert-non-ascii-characters-umlauts-accents
const normalizeAscii = (str: string): string => {
  // biome-ignore lint/suspicious/noMisleadingCharacterClass: Intentionally matching combining characters
  const combining = /[\u0300-\u036F]/g;
  return str.normalize('NFKD').replace(combining, '').toLocaleLowerCase();
};

const useKeyboardSequence = (maxDuration = 400) => {
  const [sequence, setSequence] = React.useState<Array<string>>([]);
  const lastKeyPressTime = React.useRef(0);
  
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    setSequence((prevSequence) => {
      const charCode = event.key.charCodeAt(0);
      const isPrintableAscii = event.key.length === 1 && charCode >= 32 && charCode < 127;
      
      // Note: allow 'Shift' for capital letters
      const hasModifier = (['Alt', 'AltGraph', 'Control', 'Meta'] as const).some(mod => event.getModifierState(mod));
      
      if (!isPrintableAscii || hasModifier) { return prevSequence; }
      
      event.preventDefault();
      event.stopPropagation();
      
      const now = Date.now();
      const shouldReset = now - lastKeyPressTime.current > maxDuration;
      lastKeyPressTime.current = now;
      
      if (shouldReset) {
        return [event.key];
      }
      return [...prevSequence, event.key];
    });
  }, [maxDuration]);
  
  return { handleKeyDown, sequence };
};

//
// Context
//

export type ItemKey = string;
export type ItemDef = {
  itemKey: ItemKey,
  itemPos?: undefined | number, // Explicit position of this item in the list (e.g. for virtualization)
  itemRef: React.RefObject<null | React.ComponentRef<typeof Button>>,
};

// A specifier for a given item in the list. Either an explicit target by its item key, or a number representing the
// index in the list. Negative numbers index from the end.
export type ItemTarget = number | ItemKey;

export type ListBoxContext = {
  /** Unique ID for the list box component (e.g. for ARIA attributes). */
  id: string,
  
  /** Register a new item. Returns a callback to unregister. */
  register: (itemDef: ItemDef) => () => void,
  
  /** The currently selected item (up to one at a time). */
  focusedItem: null | ItemTarget,
  
  /** Request the given `itemKey` to be focused. If `null`, unset focus. */
  focusItem: (itemKey: null | ItemTarget) => void,
  
  /** The currently selected item (up to one at a time). */
  selectedItem: null | ItemTarget,
  
  /** Request the given `itemKey` to be selected. If `null`, unset selection. */
  selectItem: (itemKey: null | ItemTarget) => void,
  
  /** Whether the whole control is currently disabled or not. */
  disabled: boolean,
  
  /** Total number of items in the list. */
  totalItems: undefined | number,
};
export const ListBoxContext = React.createContext<null | ListBoxContext>(null);
export const useListBoxContext = (itemDef: ItemDef) => {
  const context = React.use(ListBoxContext);
  if (context === null) { throw new Error(`Missing ListBoxContext provider`); }
  
  React.useEffect(() => {
    return context.register(itemDef); // Register the current item (returning the unregister callback)
  }, [context.register, itemDef]);
  
  return context;
};

// Check whether the given item matches the given target specification
const matchesItemTarget = (
  itemTarget: null | ItemTarget,
  item: {
    itemKey: ItemKey,
    itemPos: undefined | number,
  },
  totalItems: undefined | number,
): boolean => {
  if (typeof itemTarget === 'string') {
    return item.itemKey === itemTarget;
  } else if (typeof itemTarget === 'number' && typeof item.itemPos !== 'undefined') {
    if (itemTarget >= 0) {
      return item.itemPos === itemTarget;
    } else if (typeof totalItems !== 'undefined') {
      return item.itemPos === itemTarget + totalItems;
    }
  }
  return false;
};


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
  
  const context = useListBoxContext(itemDef);
  const isFocused = matchesItemTarget(context.focusedItem, { itemKey, itemPos }, context.totalItems);
  const isSelected = matchesItemTarget(context.selectedItem, { itemKey, itemPos }, context.totalItems);
  
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
  
  return (
    <Button unstyled
      id={`${context.id}_option_${itemKey}`}
      ref={itemRef}
      // biome-ignore lint/a11y/useSemanticElements: Cannot (yet) use `<option>` for this.
      role="option"
      tabIndex={-1} // Only the parent listbox is focusable
      data-item-key={itemKey}
      aria-label={label}
      aria-selected={isSelected}
      aria-posinset={itemPos}
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--option'],
        { [cl['bk-list-box__item--focused']]: isFocused },
        propsRest.className,
      )}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onPress={() => { context.selectItem(itemKey); onSelect?.(); }}
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
  
  const context = useListBoxContext(itemDef);
  const isFocused = matchesItemTarget(context.focusedItem, { itemKey, itemPos }, context.totalItems);
  
  return (
    <Button unstyled
      id={`${context.id}_action_${itemKey}`}
      ref={itemRef}
      tabIndex={-1} // Only the parent listbox is focusable
      data-item-key={itemKey}
      aria-label={label}
      aria-posinset={itemPos}
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--action'],
        { [cl['bk-list-box__item--focused']]: isFocused },
        { [cl['bk-list-box__item--sticky-end']]: sticky === 'end' },
        propsRest.className,
      )}
      onPress={() => { context.selectItem(itemKey); onActivate?.(); }}
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
  
  /** The total number of items in the list, in case the list is virtualized. */
  totalItems?: undefined | number,
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
      totalItems: totalItemsProp,
      ...propsRest
    } = props;
    
    const generatedId = React.useId();
    const id = props.id ?? generatedId;
    
    const itemsRef = React.useRef<Map<ItemKey, ItemDef>>(new Map());
    const totalItems = totalItemsProp ?? itemsRef.current.size; // If no `totalItems`, assume we're not virtualized
    
    const [focusedItem, setFocusedItem] = React.useState<null | ItemTarget>(null);
    const [selectedItem, setSelectedItem] = React.useState<null | ItemTarget>(selected ?? defaultSelected ?? null);
    
    const sortItems = React.useCallback((items: Map<ItemKey, ItemDef>): Map<ItemKey, ItemDef> => {
      // Once iterator helpers are supported we could skip the intermediate array
      const itemsEntries = Array.from(items.entries(), );
      return new Map(itemsEntries.sort(([_keyA, a], [_keyB, b]) => {
        if (a.itemPos === undefined && b.itemPos === undefined) return 0;
        if (a.itemPos === undefined) return 1;
        if (b.itemPos === undefined) return -1;
        return a.itemPos - b.itemPos;
      }));
    }, []);
    
    React.useEffect(() => { setFocusedItem(selectedItem); }, [selectedItem]); // Sync focused with selected
    // When the focused item changes, scroll it into view
    React.useEffect(() => {
      const itemRef = ((): undefined | HTMLElement => {
        if (typeof focusedItem === 'string') {
          return itemsRef.current.get(focusedItem)?.itemRef.current ?? undefined;
        } else if (typeof focusedItem === 'number') {
          if (typeof props.totalItems === 'undefined') {
            // FIXME: handle negative indices
            const FIXME = 1 satisfies 2;
            const itemKey = Array.from(itemsRef.current.keys()).at(focusedItem) ?? undefined;
            return itemKey !== undefined ? itemsRef.current.get(itemKey)?.itemRef.current ?? undefined : undefined;
          }
        }
      })();
      itemRef?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }, [focusedItem, props.totalItems]);
    
    const register = React.useCallback((itemDef: ItemDef) => {
      const itemDefs = itemsRef.current;
      if (itemDefs.has(itemDef.itemKey)) {
        console.error(`Duplicate item key: ${itemDef.itemKey}`);
      } else {
        itemsRef.current.set(itemDef.itemKey, itemDef);
      }
      itemsRef.current = sortItems(itemsRef.current);
      
      return () => {
        itemsRef.current.delete(itemDef.itemKey);
        itemsRef.current = sortItems(itemsRef.current);
      };
    }, [sortItems]);
    
    React.useEffect(() => {
      if (typeof selectedItem === 'string') {
        onSelect?.(selectedItem);
      }
    }, [selectedItem, onSelect]);
    
    const context = React.useMemo<ListBoxContext>(() => ({
      id,
      register,
      focusedItem,
      focusItem: setFocusedItem,
      selectedItem,
      selectItem: setSelectedItem,
      disabled,
      totalItems,
    }), [id, register, focusedItem, selectedItem, disabled, totalItems]);
    
    
    const keyboardSeq = useKeyboardSequence();
    
    React.useEffect(() => {
      const query: string = normalizeAscii(keyboardSeq.sequence.join(''));
      
      if (query.trim() === '') { return; }
      
      for (const [itemKey, item] of itemsRef.current) {
        const elementRef = item.itemRef.current;
        const elementText = elementRef?.innerText ?? null;
        
        if (elementText !== null && normalizeAscii(elementText).startsWith(query)) {
          setFocusedItem(itemKey);
          break;
        }
      }
    }, [keyboardSeq.sequence]);
    
    const handleKeyInput = React.useCallback((event: React.KeyboardEvent) => {
      const selectedItem = context.selectedItem;
      const focusedItem = context.focusedItem ?? selectedItem;
      
      const itemKeys: Array<ItemKey> = [...itemsRef.current.entries()]
        .map(([itemKey]) => itemKey);
      
      // Filter only the items that are (programmatically) focusable.
      const itemKeysFocusable: Array<ItemKey> = [...itemsRef.current.entries()]
        .filter(([_, { itemRef }]) => itemRef.current && isItemProgrammaticallyFocusable(itemRef.current))
        .map(([itemKey]) => itemKey);
      
      // If no focusable items, do nothing (allows us to assume there is at least one item)
      if (itemKeysFocusable.length === 0 && (typeof totalItems === 'undefined' || totalItems === 0)) {
        return;
      }
      
      // Get the index of the "current" item (either the focused item, or the first item if none focused)
      const itemIndex = ((): number => {
        if (focusedItem === null) {
          return 0;
        } else if (typeof focusedItem === 'string') {
          const focusedItemDef = itemsRef.current.get(focusedItem);
          if (typeof focusedItemDef === 'undefined') { throw new Error(`Should not happen`); }
          return focusedItemDef.itemPos ?? Math.min(0, itemKeys.indexOf(focusedItem));
        } else if (typeof focusedItem === 'number') {
          const total = typeof totalItems !== 'undefined' ? totalItems : itemKeys.length;
          return focusedItem >= 0 ? focusedItem : (focusedItem + total);
        } else {
          return 0;
        }
      })();
      if (itemIndex < 0) {
        console.error(`Could not resolve focused item: '${focusedItem}'`);
      }
      // Determine the target item to focus based on the keyboard event (if any). If `null`, do not navigate.
      const itemTarget = ((): null | ItemTarget => {
        // Note: listboxes should not "cycle" (e.g. going beyond the last item should not go to the first)
        switch (event.key) {
          case 'Enter':
          case ' ':
            return itemIndex; // Just return the current item (which will be targeted for selection)
          case 'ArrowUp': {
            // const itemPrevIndex = itemIndex === 0 ? 0 : itemIndex - 1;
            // const itemPrev: undefined | ItemKey = itemKeysFocusable.at(itemPrevIndex);
            // if (typeof itemPrev === 'undefined') { throw new Error(`Should not happen`); }
            // return itemPrev;
            return Math.max(0, itemIndex - 1);
          }
          case 'ArrowDown': {
            // const itemNextIndex = itemIndex + 1 >= itemKeysFocusable.length
            //   ? itemKeysFocusable.length - 1
            //   : itemIndex + 1;
            // const itemNext: undefined | ItemKey = itemKeysFocusable.at(itemNextIndex);
            // if (typeof itemNext === 'undefined') { throw new Error(`Should not happen`); }
            // return itemNext;
            
            return Math.min(totalItems - 1, itemIndex + 1);
          }
          case 'PageUp': return Math.max(0, itemIndex - 10); // On Mac: Fn + ArrowUp
          case 'PageDown': return Math.min(totalItems - 1, itemIndex + 10); // On Mac: Fn + ArrowDown
          case 'Home': return 0; // On Mac: Fn + ArrowLeft
          case 'End': return -1; // On Mac: Fn + ArrowRight
          default: return null;
        }
      })();
      
      if (itemTarget !== null) {
        event.preventDefault(); // Prevent default behavior, like scrolling
        event.stopPropagation(); // Prevent the key event from triggering other behavior
        
        if (['Enter', ' '].includes(event.key) && typeof itemTarget === 'string') {
          setSelectedItem(itemTarget);
        } else {
          setFocusedItem(itemTarget);
        }
      }
    }, [context, totalItems]);
    
    return (
      <ListBoxContext value={context}>
        <div
          // biome-ignore lint/a11y/useSemanticElements: Cannot (yet) use `<select>` for this purpose.
          role="listbox"
          tabIndex={0} // The outer listbox is focusable, not the individual items
          aria-label={label}
          aria-activedescendant={selectedItem ? `${context.id}_option_${selectedItem}` : undefined}
          data-empty-placeholder="No items"
          {...propsRest}
          onKeyDown={mergeCallbacks([handleKeyInput, keyboardSeq.handleKeyDown])}
          onBlur={() => { setFocusedItem(null); }}
          className={cx(
            'bk',
            { [cl['bk-list-box']]: !unstyled },
            propsRest.className,
          )}
        >
          {/* Hidden input, so that this component can be connected to a <form> element */}
          <input type="hidden" name={name} form={form} {...inputProps} value={selectedItem ?? ''} onChange={() => {}}/>
          
          {children}
        </div>
      </ListBoxContext>
    );
  },
  {
    Option,
    Header,
    Action,
  },
);
