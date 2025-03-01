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
  itemRef: React.RefObject<null | React.ComponentRef<typeof Button>>,
};

export type ListBoxContext = {
  id: string, // Unique ID for the component (e.g. for ARIA attributes)
  register: (itemDef: ItemDef) => () => void, // Register a new item; returns a callback to unregister
  focusedItem: null | ItemKey, // The currently selected item (up to one at a time)
  focusItem: (itemKey: null | ItemKey) => void, // Callback to request the given `itemKey` to be focused
  selectedItem: null | ItemKey, // The currently selected item (up to one at a time)
  selectItem: (itemKey: ItemKey) => void, // Callback to request the given `itemKey` to be selected
  
  disabled: boolean, // Whether the whole control is currently disabled or not
  //itemProps?: undefined | ((optionState: OptionState) => Record<string, unknown>), // Additional props for the item
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
 * A dropdown menu item that can be selected.
 */
export const Option = (props: OptionProps) => {
  const { itemKey, label, icon, onSelect, requireIntent = false, ...propsRest } = props;
  
  const itemRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const itemDef = React.useMemo<ItemDef>(() => ({ itemKey, itemRef }), [itemKey]);
  
  const hasHover = React.useRef<boolean>(false);
  
  const context = useListBoxContext(itemDef);
  const isFocused = context.focusedItem === itemKey;
  const isSelected = context.selectedItem === itemKey;
  
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
  
  /** The human-readable label to be shown. */
  label: string,
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
  
  /** The event handler for when the user activates this action. */
  onActivate: () => void | Promise<void>,
};
/**
 * A dropdown menu item that can be activated to perform some action.
 */
export const Action = (props: ActionProps) => {
  const { itemKey, label, icon, onActivate, ...propsRest } = props;
  
  const itemRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const itemDef = React.useMemo<ItemDef>(() => ({ itemKey, itemRef }), [itemKey]);
  
  const context = useListBoxContext(itemDef);
  const isFocused = context.focusedItem === itemKey;
  
  return (
    <Button unstyled
      id={`${context.id}_action_${itemKey}`}
      ref={itemRef}
      tabIndex={-1} // Only the parent listbox is focusable
      data-item-key={itemKey}
      aria-label={label}
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--action'],
        { [cl['bk-list-box__item--focused']]: isFocused },
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

export type ListBoxProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** An accessible name for this listbox menu. Required. */
  label: string,
  
  /** The default option to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | ItemKey,

  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | ItemKey,
  
  /** Event handler to be called when the selected option state changes. */
  onSelect?: undefined | ((optionKey: ItemKey) => void),
  
  /** Whether the list box is disabled or not. Default: false. */
  disabled?: undefined | boolean,
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
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
      inputProps,
      ...propsRest
    } = props;
    
    const generatedId = React.useId();
    const id = props.id ?? generatedId;
    
    const itemsRef = React.useRef<Map<ItemKey, ItemDef>>(new Map());
    const [focusedItem, setFocusedItem] = React.useState<null | ItemKey>(null);
    const [selectedItem, setSelectedItem] = React.useState<null | ItemKey>(selected ?? defaultSelected ?? null);
    
    React.useEffect(() => { setFocusedItem(selectedItem); }, [selectedItem]); // Sync focused with selected
    // When the focused item changes, scroll it into view
    React.useEffect(() => {
      if (focusedItem === null) { return; }
      itemsRef.current.get(focusedItem)?.itemRef.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }, [focusedItem]);
    
    const register = React.useCallback((itemDef: ItemDef) => {
      const itemDefs = itemsRef.current;
      if (itemDefs.has(itemDef.itemKey)) {
        console.error(`Duplicate item key: ${itemDef.itemKey}`);
      } else {
        itemsRef.current.set(itemDef.itemKey, itemDef);
      }
      
      return () => {
        itemsRef.current.delete(itemDef.itemKey);
      };
    }, []);
    
    const selectItem = React.useCallback((itemKey: ItemKey) => {
      setSelectedItem(selectedItem => {
        if (itemKey !== selectedItem) {
          onSelect?.(itemKey);
          return itemKey;
        } else {
          return selectedItem;
        }
      });
    }, [onSelect]);
    
    const context = React.useMemo<ListBoxContext>(() => ({
      id,
      register,
      focusedItem,
      focusItem: setFocusedItem,
      selectedItem,
      selectItem,
      disabled,
    }), [id, register, focusedItem, selectedItem, selectItem, disabled]);
    
    
    
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
      
      // Get the list of item keys, ideally in the order that they are displayed to the user.
      // Filter only the items that are (programmatically) focusable.
      const itemKeys: Array<ItemKey> = [...itemsRef.current.entries()]
        .filter(([_, { itemRef }]) => itemRef.current && isItemProgrammaticallyFocusable(itemRef.current))
        .map(([itemKey]) => itemKey);
      
      const itemIndex: number = focusedItem === null ? 0 : itemKeys.indexOf(focusedItem);
      if (itemIndex < 0) {
        console.error(`Could not resolve focused item: '${focusedItem}'`);
      }
      
      // Determine the target item to focus based on the keyboard event (if any)
      const itemTarget = ((): null | ItemKey => {
        // Note: listboxes should not "cycle" (e.g. going beyond the last item should not go to the first)
        switch (event.key) {
          case 'Enter':
          case ' ': {
            if (focusedItem === null) { return itemKeys.at(0) ?? null; }
            return focusedItem;
          }
          case 'ArrowUp': {
            if (focusedItem === null) { return itemKeys.at(0) ?? null; }
            
            const itemPrevIndex = itemIndex === 0 ? 0 : itemIndex - 1;
            const itemPrev: undefined | ItemKey = itemKeys.at(itemPrevIndex);
            if (typeof itemPrev  === 'undefined') { throw new Error(`Should not happen`); }
            return itemPrev;
          }
          case 'ArrowDown': {
            if (focusedItem === null) { return itemKeys.at(0) ?? null; }
            
            const itemNextIndex = itemIndex + 1 >= itemKeys.length ? itemKeys.length - 1 : itemIndex + 1;
            const itemNext: undefined | ItemKey = itemKeys.at(itemNextIndex);
            if (typeof itemNext  === 'undefined') { throw new Error(`Should not happen`); }
            return itemNext;
          }
          case 'Home': // On Mac keyboards this can be simulated with Fn + ArrowLeft
          case 'PageUp': { // On Mac keyboards this can be simulated with Fn + ArrowUp
            if (focusedItem === null) { return itemKeys.at(0) ?? null; }
            
            const itemFirst: undefined | ItemKey = itemKeys.at(0);
            if (typeof itemFirst  === 'undefined') { throw new Error(`Should not happen`); }
            return itemFirst;
          }
          case 'End': // On Mac keyboards this can be simulated with Fn + ArrowRight
          case 'PageDown': { // On Mac keyboards this can be simulated with Fn + ArrowDown
            if (focusedItem === null) { return itemKeys.at(-1) ?? null; }
            
            const itemLast: undefined | ItemKey = itemKeys.at(-1);
            if (typeof itemLast  === 'undefined') { throw new Error(`Should not happen`); }
            return itemLast;
          }
          default: return null;
        }
      })();
      
      if (itemTarget !== null) {
        event.preventDefault(); // Prevent default behavior, like scrolling
        event.stopPropagation(); // Prevent the key event from triggering other behavior
        
        if (['Enter', ' '].includes(event.key)) {
          setSelectedItem(itemTarget);
        } else {
          setFocusedItem(itemTarget);
        }
      }
    }, [context]);
    
    
    const renderContent = () => {
      return children;
    };
    
    // FIXME: need to implement keyboard arrow (up/down) navigation through items, as per:
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
    return (
      <ListBoxContext value={context}>
        <div
          // biome-ignore lint/a11y/useSemanticElements: Cannot (yet) use `<select>` for this purpose.
          role="listbox"
          tabIndex={0} // The outer listbox is focusable, not the individual items
          aria-label={label}
          aria-activedescendant={selectedItem ? `${context.id}_option_${selectedItem}` : undefined}
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
          <input type="hidden" {...inputProps} value={selectedItem ?? ''} onChange={() => {}}/>
          
          {renderContent()}
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
