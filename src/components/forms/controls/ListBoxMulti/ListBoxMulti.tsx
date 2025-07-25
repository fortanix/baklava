/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, mergeCallbacks } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { useScroller } from '../../../../layouts/util/Scroller.tsx';

import { TextLine } from '../../../text/TextLine/TextLine.tsx';
import { type IconName, Icon as BkIcon } from '../../../graphics/Icon/Icon.tsx';
import { Spinner } from '../../../graphics/Spinner/Spinner.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import { CheckboxClassNames } from '../Checkbox/Checkbox.tsx';

import {
  type ItemKey,
  type ItemDef,
  type ItemDetails,
  type ItemWithKey,
  type VirtualItemKeys,
  ListBoxContext,
  useListBoxSelector,
  useListBox,
  useListBoxItem,
} from './ListBoxStore.tsx';

import cl from './ListBoxMulti.module.scss';


/*
References:
- https://www.w3.org/WAI/ARIA/apg/patterns/listbox
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
- https://react-spectrum.adobe.com/react-spectrum/ListBox.html
- https://www.radix-ui.com/primitives/docs/components/select
*/

export { type ItemKey, type ItemDef, type ItemDetails, ListBoxContext, useListBoxItem };
export { cl as ListBoxClassNames };


export interface ListBoxMultiRef extends HTMLDivElement {
  _bkListBoxFocusFirst: () => void,
  _bkListBoxFocusLast: () => void,
  // TODO:
  //_bkListBoxSelectNone: () => void,
  //_bkListBoxSelectAll: () => void,
};

type ListBoxIcon = React.ComponentType<Pick<React.ComponentProps<typeof BkIcon>, 'icon' | 'className' | 'decoration'>>;


//
// Static item
//

export type StaticProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the item should stick on scroll. Default: false. */
  sticky?: undefined | false | 'start',
};
/**
 * A static item, that can be customized for any content that does not need to interact with the list box store.
 */
export const Static = ({ unstyled, sticky = false, ...propsRest }: StaticProps) => {
  return (
    <div
      {...propsRest}
      className={cx(
        { [cl['bk-list-box-multi__item']]: !unstyled },
        cl['bk-list-box-multi__item--static'],
        { [cl['bk-list-box-multi__item--sticky-start']]: sticky === 'start' },
        propsRest.className,
      )}
    />
  );
};


//
// Option item
//

export type OptionProps = ComponentProps<typeof Button> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
  
  /** An accessible name for this option. */
  label: string,
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
  
  /** How to decorate the icon. Default: undefined (i.e. no decoration). */
  iconDecoration?: undefined | 'highlight',
  
  /** A callback to be called when the option is selected. */
  onSelect?: undefined | ((isSelected: boolean) => void),
  
  /** Custom icon component. */
  Icon?: undefined | ListBoxIcon,
};
/**
 * A list box item that can be selected.
 */
export const Option = (props: OptionProps) => {
  const { unstyled, itemKey, label, icon, iconDecoration, onSelect, Icon = BkIcon, ...propsRest } = props;
  
  const itemRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const itemDef = React.useMemo<ItemWithKey>(() => ({ itemKey, itemRef, isContentItem: true }), [itemKey]);
  
  const { id, disabled, isFocused, isSelected, toggleSelection } = useListBoxItem(itemDef);
  const isNonactive = propsRest.disabled || propsRest.nonactive || disabled;
  
  const handlePress = React.useCallback(() => {
    const isSelected = toggleSelection();
    onSelect?.(isSelected);
  }, [toggleSelection, onSelect]);
  
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
      {...propsRest}
      className={cx(
        { [cl['bk-list-box-multi__item']]: !unstyled },
        { [cl['bk-list-box-multi__item--disabled']]: isNonactive },
        cl['bk-list-box-multi__item--option'],
        propsRest.className,
      )}
      // See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets#grouping_controls
      disabled={false} // Use `nonactive` for disabled state, so that we still allow focus
      nonactive={isNonactive}
      onPress={handlePress}
    >
      {/* Note: should not be an actual `<input type="checkbox">` element, buttons can't have interactive children */}
      <span
        className={cx(
          CheckboxClassNames['bk-checkbox'],
          { 'pseudo-disabled': isNonactive },
          { 'pseudo-checked': isSelected },
        )}
      />
      
      {icon &&
        <Icon
          icon={icon}
          decoration={iconDecoration !== 'highlight' ? undefined : { type: 'background-circle' }}
          className={cx(
            cl['bk-list-box-multi__item__icon'],
            { [cl['bk-list-box-multi__item__icon--highlight']]: iconDecoration === 'highlight' },
          )}
        />
      }
      <TextLine className={cl['bk-list-box-multi__item__label']}>{propsRest.children ?? label}</TextLine>
    </Button>
  );
};


//
// Header item
//

export type HeaderProps = ComponentProps<typeof Button> & {
  /** A unique identifier for this item. */
  itemKey: ItemKey,
  
  /** An accessible name for this header. */
  label: string,
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
  
  /** Whether the action should stick on scroll. Default: 'start'. */
  sticky?: undefined | false | 'start',
  
  /** Custom icon component. */
  Icon?: undefined | ListBoxIcon,
};
/**
 * A static text item that can be used as a heading.
 */
export const Header = (props: HeaderProps) => {
  const { unstyled, itemKey, label, icon, sticky = 'start', Icon = BkIcon, ...propsRest } = props;
  
  return (
    <span
      data-item-key={itemKey}
      {...propsRest}
      className={cx(
        { [cl['bk-list-box-multi__item']]: !unstyled },
        cl['bk-list-box-multi__item--static'],
        cl['bk-list-box-multi__item--header'],
        { [cl['bk-list-box-multi__item--sticky-start']]: sticky === 'start' },
        propsRest.className,
      )}
    >
      {icon && <Icon icon={icon} className={cl['bk-list-box-multi__item__icon']}/>}
      <span className={cl['bk-list-box-multi__item__label']}>{propsRest.children ?? label}</span>
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
  
  /** An accessible name for this action. */
  label: string,
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
  
  /** Whether this action is positioned sticky. Default: false. */
  sticky?: undefined | false | 'end',
  
  /** The event handler for when the user activates this action. */
  onActivate: () => void | Promise<void>,
  
  /** Custom icon component. */
  Icon?: undefined | ListBoxIcon,
};
/**
 * A list box item that can be activated to perform some action.
 */
export const Action = (props: ActionProps) => {
  const { unstyled, itemKey, itemPos, label, icon, sticky = false, onActivate, Icon = BkIcon, ...propsRest } = props;
  
  const itemRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const itemDef = React.useMemo<ItemWithKey>(() => ({
    itemKey,
    itemRef,
    isContentItem: sticky === false,
  }), [itemKey, sticky]);
  
  const { id, disabled, isFocused, requestFocus } = useListBoxItem(itemDef);
  const isNonactive = propsRest.disabled || propsRest.nonactive || disabled;
  
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
        { [cl['bk-list-box-multi__item']]: !unstyled },
        { [cl['bk-list-box-multi__item--disabled']]: isNonactive },
        cl['bk-list-box-multi__item--action'],
        propsRest.className,
      )}
      // See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets#grouping_controls
      disabled={false} // Use `nonactive` for disabled state, so that we still allow focus
      nonactive={isNonactive}
      onPress={() => { requestFocus(); onActivate?.(); }}
    >
      {icon && <Icon icon={icon} className={cl['bk-list-box-multi__item__icon']}/>}
      <span className={cl['bk-list-box-multi__item__label']}>{propsRest.children ?? label}</span>
    </Button>
  );
};

export const FooterAction = (props: Omit<ActionProps, 'sticky'>) => {
  return <Action {...props} sticky="end"/>;
};
export const FooterActions = (props: React.ComponentProps<'div'>) => {
  return <div {...props} className={cx(cl['bk-list-box-multi__footer-actions'], props.className)}/>;
};


//
// List box
//
export type ListBoxMultiProps<K extends ItemKey = ItemKey> = Omit<ComponentProps<'div'>, 'ref' | 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A React ref to pass to the list box element. */
  ref?: undefined | React.Ref<null | ListBoxMultiRef>,
  
  /** The (inline) size of the list box. Optional. Default: `medium`. */
  size?: undefined | 'shrink' | 'small' | 'medium' | 'large',
  
  /** An accessible name for this list box. Required. */
  label: string,
  
  /** The default option to select. Only relevant for uncontrolled usage (i.e. `selected` is `undefined`). */
  defaultSelected?: undefined | Set<K>,
  
  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | Set<K>,
  
  /** Event handler to be called when the selected option state changes. */
  onSelect?: undefined | ((selectedItems: Set<K>, itemDetails: Map<K, ItemDetails>) => void),
  
  /** Whether the list box is disabled or not. Default: false. */
  disabled?: undefined | boolean,
  
  /** The machine readable name of the list box control, used as part of `<form>` submission. */
  name?: undefined | string,
  
  /** A placeholder message to display when there are no items in the list. Set to `false` to prevent showing. */
  placeholderEmpty?: undefined | false | React.ReactNode,
  
  /** The ID of the `<form>` element to associate this list box with. Optional. */
  form?: undefined | string,
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
  
  /** Render the given item key as a string label. If not given, will use the item element's text value. */
  formatItemLabel?: undefined | ((itemKey: K) => undefined | string),
  
  /** Whether the list is currently in loading state. Default: false. */
  isLoading?: undefined | boolean,
  
  /** If the list is virtually rendered, `virtualItemKeys` should be provided with the full list of item keys. */
  virtualItemKeys?: undefined | null | VirtualItemKeys,
};

type HiddenSelectedStateProps = Pick<ListBoxMultiProps, 'name' | 'form' | 'inputProps'> & {
  ref: React.Ref<React.ComponentRef<'input'>>,
};
/** Hidden input, so that this component can be connected to a <form> element. */
const HiddenSelectedState = ({ ref, name, form, inputProps }: HiddenSelectedStateProps) => {
  const selectedItems = useListBoxSelector(s => s.selectedItems);
  const onChange = React.useCallback(() => {}, []);
  return (
    <>
      {[...selectedItems.values()].map(selectedItem =>
        <input
          key={selectedItem}
          type="hidden"
          name={`${name}[]`}
          form={form}
          {...inputProps}
          ref={mergeRefs(ref, inputProps?.ref)}
          value={selectedItem ?? ''}
          onChange={onChange}
        />
      )}
    </>
  );
};

const EmptyPlaceholder = (props: React.ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={cx(
        cl['bk-list-box-multi__item'],
        cl['bk-list-box-multi__item--static'],
        cl['bk-list-box-multi__item--disabled'],
        cl['bk-list-box-multi__empty-placeholder'],
        props.className,
      )}
    />
  );
};

/**
 * A list box is a composite control, consisting of a (flat) list of items. Each item can be either an option that can
 * be selected, or an action that can be activated. The items list may be partial, in case of virtualization (see
 * also `ListBoxLazy`). In this case, the `itemKeys` prop must be provided so that the list box can determine the
 * identity and ordering of the full list.
 */
export const ListBoxMulti = Object.assign(
  <K extends ItemKey = ItemKey>(props: ListBoxMultiProps<K>) => {
    const {
      ref,
      children,
      unstyled = false,
      size = 'medium',
      label,
      defaultSelected,
      selected,
      onSelect,
      disabled = false,
      name,
      placeholderEmpty = 'No items',
      form,
      inputProps,
      isLoading = false,
      virtualItemKeys = null,
      formatItemLabel,
      ...propsRest
    } = props;
    
    const id = React.useId();
    const listBoxRef = React.useRef<ListBoxMultiRef>(null);
    const inputRef = React.useRef<React.ComponentRef<typeof HiddenSelectedState>>(null);
    const scrollerProps = useScroller();
    
    /*
    Set up the list box store.
    
    NOTE: be careful not to use `useStore` or any other hook that would cause a re-render when the store is updated.
    This would cause all items in the list to re-render unnecessarily. Instead, you can:
      - Separate logic out to a separate component (as in `HiddenSelectedState`).
      - Use `listBox.store.subscribe` for side effects.
    */
    const selectedItemKeysDefault = selected ?? defaultSelected ?? new Set();
    const listBox = useListBox(listBoxRef, {
      id: props.id ?? id,
      disabled,
      selectedItems: selectedItemKeysDefault,
      focusedItem: null,
      virtualItemKeys,
    });
    
    // Sync `selected` prop to the store
    const selectedSerialized = typeof selected === 'undefined' ? '' : JSON.stringify([...selected.values()]);
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using a serialized version of `selected`.
    React.useEffect(() => {
      if (typeof selected !== 'undefined') {
        const state = listBox.store.getState();
        state.setSelectedItems(selected);
        
        const firstItemKey = selected.values().next().value;
        if (typeof firstItemKey !== 'undefined') {
          state.focusItem(firstItemKey);
        }
      }
    }, [selectedSerialized, listBox.store]);
    
    // Note: needs the explicit generics since `Ref<T>` has some special handling of `null` that messes with inference
    React.useImperativeHandle<null | ListBoxMultiRef, null | ListBoxMultiRef>(ref, () => {
      const listBoxElement = listBoxRef.current;
      if (listBoxElement === null) { return null; }
      return Object.assign(listBoxElement, {
        focus: () => {
          const state = listBox.store.getState();
          if (state.focusedItem) {
            state.focusItem(state.focusedItem);
          }
        },
        _bkListBoxFocusFirst: () => { listBox.store.getState().focusItemAt('first'); },
        _bkListBoxFocusLast: () => { listBox.store.getState().focusItemAt('last'); },
      });
    }, [listBox]);
    
    // Keep the `virtualItemKeys` prop in sync with the store
    React.useEffect(() => {
      return listBox.store.subscribe(state => {
        if (state.virtualItemKeys !== virtualItemKeys) {
          state.setVirtualItemKeys(virtualItemKeys);
        }
      });
    }, [listBox.store, virtualItemKeys]);
    
    const isEmpty = useListBoxSelector(state => state.isEmpty(), listBox.store);
    
    React.useEffect(() => {
      return listBox.store.subscribe((state, prevState) => {
        if (state.selectedItems !== prevState.selectedItems) {
          const itemKeys = state.selectedItems as Set<K>;
          
          const itemDetails = new Map<K, ItemDetails>([...itemKeys.values()].map(itemKey => {
            const label: string = formatItemLabel?.(itemKey)
              ?? state._internalItemsRegistry.get(itemKey)?.itemRef.current?.textContent
              ?? itemKey;
            return [itemKey, { label }];
          }));
          
          onSelect?.(itemKeys, itemDetails);
        }
      });
    }, [listBox.store, onSelect, formatItemLabel]);
    
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        const formId = inputRef.current?.getAttribute('form');
        if (!formId) { return; }
        
        const form = document.getElementById(formId);
        if (form instanceof HTMLFormElement) {
          // Submit the form (after a timeout to allow the `<input>` to be updated in response to the Enter key event)
          window.setTimeout(() => { form.requestSubmit(); }, 0);
        }
      }
    }, []);
    
    // Note: WCAG requires at least one element with `role="option"` (or "group") in a `role="listbox"`. If there are
    // no options, then we should not render a `role="listbox"`.
    // https://github.com/dequelabs/axe-core/issues/383
    // https://github.com/dequelabs/axe-core/issues/2339
    // We can instead just render a normal (`role="presentation"`) element, see for example how it's done in MUI:
    // https://mui.com/material-ui/react-autocomplete/#combo-box
    const ariaProps = isEmpty ? {
      'aria-describedby': `${id}_empty-placeholder`,
    } : {
      role: 'listbox',
      'aria-label': label,
      'aria-busy': isLoading,
    } as const;
    
    return (
      <listBox.Provider>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: `onKeyDown` needed as event ancestor (bubbling). */}
        <div
          {...scrollerProps}
          tabIndex={undefined} // Do not make the listbox focusable, use a roving tabindex instead
          {...ariaProps}
          {...propsRest}
          {...listBox.props}
          ref={listBoxRef}
          onKeyDown={mergeCallbacks([handleKeyDown, propsRest.onKeyDown, listBox.props.onKeyDown])}
          onToggle={mergeCallbacks([props.onToggle, listBox.props.onToggle])}
          className={cx(
            scrollerProps.className,
            'bk',
            { [cl['bk-list-box-multi']]: !unstyled },
            { [cl['bk-list-box-multi--empty']]: isEmpty },
            { [cl['bk-list-box-multi--size-shrink']]: size === 'shrink' },
            { [cl['bk-list-box-multi--size-small']]: size === 'small' },
            { [cl['bk-list-box-multi--size-medium']]: size === 'medium' },
            { [cl['bk-list-box-multi--size-large']]: size === 'large' },

            listBox.props.className,
            propsRest.className,
          )}
        >
          {typeof name === 'string' && <HiddenSelectedState ref={inputRef} name={name} form={form}/>}
          
          {children}
          
          {isEmpty && placeholderEmpty !== false && !isLoading &&
            <EmptyPlaceholder id={`${id}_empty-placeholder`}>{placeholderEmpty}</EmptyPlaceholder>
          }
          
          {isLoading &&
            <span
              className={cx(
                cl['bk-list-box-multi__item'],
                cl['bk-list-box-multi__item--static'],
                cl['bk-list-box-multi__item--loading'],
              )}
            >
              Loading... <Spinner inline size="small"/>
            </span>
          }
        </div>
      </listBox.Provider>
    );
  },
  {
    Static,
    Option,
    Header,
    Action,
    FooterAction,
    FooterActions,
    EmptyPlaceholder,
  },
);
