/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, mergeProps } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { useScroller } from '../../../../layouts/util/Scroller.tsx';
import { useFocusGroup } from '../../../../util/hooks/useFocusGroup.ts';
import { useStore } from 'zustand';

import { Spinner } from '../../../graphics/Spinner/Spinner.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

import {
  type ItemKey,
  // type ItemDef,
  // type ItemDetails,
  // type ItemWithKey,
  // type VirtualItemKeys,
  useListBoxContext,
  useListBox,
  useListBoxItem,
} from '../../../util/collections/ListBoxStore.tsx';

import cl from './ListBox.module.scss';


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
// ListBoxConfigContext: used to pass component configuration from parent to items.
//

type ListBoxConfigContext = { disabled: boolean };
const ListBoxConfigContext = React.createContext<null | ListBoxConfigContext>(null);
const useListBoxConfigContext = (): ListBoxConfigContext => {
  const context = React.use(ListBoxConfigContext);
  if (context === null) { throw new Error(`Missing ListBoxConfigContext`); }
  return context;
};


//
// ListBoxRef
//

export interface ListBoxRef extends HTMLDivElement {
  _bkListBoxFocusFirst: () => void,
  _bkListBoxFocusLast: () => void,
};

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
        { [cl['bk-list-box__item']]: !unstyled },
        cl['bk-list-box__item--static'],
        { [cl['bk-list-box__item--sticky-start']]: sticky === 'start' },
        propsRest.className,
      )}
    />
  );
};


//
// Option item
//

export type OptionProps = Omit<ComponentProps<typeof Button>, 'onSelect'> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
};
/**
 * A list box item that can be selected.
 */
export const Option = (props: OptionProps) => {
  const { unstyled, itemKey, className, ...propsRest } = props;
  
  const { disabled } = useListBoxConfigContext();
  const { selected, requestSelected, props: itemProps } = useListBoxItem({ itemKey });
  
  const isNonactive = propsRest.disabled || propsRest.nonactive || disabled;
  const handlePress = React.useCallback(() => {
    if (isNonactive) { return; }
    requestSelected();
  }, [isNonactive, requestSelected]);
  
  return (
    <Button
      //unstyled // FIXME: have a `styling="basic"` variant?
      //role="option" // Already set automatically by `focusgroup`
      //focusgroupstart={isSelected ? '' : undefined} // Not needed, rely on `focusgroup` memory instead
      wrap={false}
      {...mergeProps(
        itemProps,
        propsRest,
        {
          className: cx(
            { [cl['bk-list-box__item']]: !unstyled },
            { [cl['bk-list-box__item--nonactive']]: isNonactive },
            cl['bk-list-box__item--option'],
            className,
          ),
          onPress: handlePress,
        },
      )}
      aria-selected={selected}
      disabled={false} // Never use `disabled`, only use `nonactive`, so that we still allow focus
      nonactive={isNonactive}
    />
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
        { [cl['bk-list-box__item']]: !unstyled },
        cl['bk-list-box__item--static'],
        cl['bk-list-box__item--header'],
        { [cl['bk-list-box__item--sticky-start']]: sticky === 'start' },
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
        { [cl['bk-list-box__item']]: !unstyled },
        { [cl['bk-list-box__item--disabled']]: isNonactive },
        cl['bk-list-box__item--action'],
        propsRest.className,
      )}
      // See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets#grouping_controls
      disabled={false} // Use `nonactive` for disabled state, so that we still allow focus
      nonactive={isNonactive}
      onPress={() => { requestFocus(); onActivate?.(); }}
    >
      {icon && <Icon icon={icon} className={cl['bk-list-box__item__icon']}/>}
      <span className={cl['bk-list-box__item__label']}>{propsRest.children ?? label}</span>
    </Button>
  );
};

export const FooterAction = (props: Omit<ActionProps, 'sticky'>) => {
  return <Action {...props} sticky="end"/>;
};
export const FooterActions = (props: React.ComponentProps<'div'>) => {
  return <div {...props} className={cx(cl['bk-list-box__footer-actions'], props.className)}/>;
};


//
// List box
//

type SelectedState = null | ItemKey;
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
type PropsOmit = 'ref' | keyof SelectedStateProps | 'defaultChecked' | 'defaultValue' | 'onSelect';
export type ListBoxProps = Omit<ComponentProps<'div'>, PropsOmit> & SelectedStateProps & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A React ref to pass to the list box element. */
  ref?: undefined | React.Ref<null | ListBoxRef>,
  
  /** An accessible name for this list box. Required. */
  label: string,
  
  /** The orientation of the list box, either block or inline. Default: `"block"`. */
  orientation?: undefined | 'inline' | 'block',
  
  /** The (inline) size of the list box. Optional. Default: `medium`. */
  size?: undefined | 'shrink' | 'small' | 'medium' | 'large',
  
  /** Whether the list box is disabled or not. Default: false. */
  disabled?: undefined | boolean,
  
  /** The machine readable name of the list box control, used as part of `<form>` submission. */
  name?: undefined | string,
  
  /** A placeholder message to display when there are no items in the list. Set to `false` to prevent showing. */
  placeholderEmpty?: undefined | false | React.ReactNode,
  
  /** Whether the list is currently in loading state. Default: false. */
  isLoading?: undefined | boolean,
  
  /** The ID of the `<form>` element to associate this list box with. Optional. */
  form?: undefined | string,
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'defaultValue' | 'onChange'>,
  
  /** Render the given item key as a string label. If not given, will use the item element's text value. */
  formatItemLabel?: undefined | ((itemKey: ItemKey) => undefined | string),
  
  /** If the list is virtually rendered, `virtualItemKeys` should be provided with the full list of item keys. */
  virtualItemKeys?: undefined | null | VirtualItemKeys,
  
  /** Alias for `onSelectedChange`, for backwards compatbility. @deprecated */
  onSelect?: undefined | ((selected: SelectedState) => void),
};

export const EmptyPlaceholder = (props: React.ComponentProps<'div'>) => {
  return (
    <div
      {...props}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--static'],
        cl['bk-list-box__item--disabled'],
        cl['bk-list-box__empty-placeholder'],
        props.className,
      )}
    />
  );
};

export const LoadingSpinner = (props: React.ComponentProps<'span'>) => {
  return (
    <span
      {...props}
      className={cx(
        cl['bk-list-box__item'],
        cl['bk-list-box__item--static'],
        cl['bk-list-box__item--loading'],
        props.className,
      )}
    >
      Loading... <Spinner inline size="small"/>
    </span> 
  );
};

type HiddenSelectedStateProps = ListBoxProps['inputProps'] & {};
/** Hidden input, so that this component can be connected to a <form> element. */
const HiddenSelectedState = ({ ref, name, form, ...inputProps }: HiddenSelectedStateProps) => {
  const { store } = useListBoxContext();
  const selectedItemKey = useStore(store, s => s.selectedItemKey);
  
  return (
    <input
      ref={ref}
      // When there is no selected item, we will still render the input (so that we can get the `input.form`
      // association), but we will leave the `name` blank. This way, form submit handlers can distinguish between
      // "no selected" and "selected an item with key = empty string".
      name={typeof selectedItemKey === 'string' ? name : undefined}
      form={form}
      type="hidden"
      {...inputProps}
      value={selectedItemKey ?? ''}
      defaultValue={undefined}
      onChange={undefined}
    />
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
      ref,
      selected,
      defaultSelected,
      onSelectedChange,
      onSelect,
      unstyled = false,
      label,
      orientation = 'block',
      size = 'medium',
      disabled = false,
      name,
      form,
      placeholderEmpty = 'No items',
      inputProps,
      isLoading = false,
      virtualItemKeys = null,
      formatItemLabel,
      ...propsRest
    } = props;
    
    const id = `bk-listbox-${React.useId()}`;
    const listBoxRef = React.useRef<ListBoxRef>(null);
    const scrollerProps = useScroller();
    const focusGroupProps = useFocusGroup({ focusGroup: `listbox ${orientation}` });
    
    const listBoxConfigContext = React.useMemo<ListBoxConfigContext>(() => ({ disabled }), [disabled]);
    
    /*
    Set up the list box store.
    
    NOTE: be careful to limit use of `useStore` or other hooks that would cause a re-render when the store is updated.
    This would cause all items in the list to re-render unnecessarily. Instead, you can:
      - Separate logic out to a separate component (like we did for `HiddenSelectedState`).
      - Use `listBox.store.subscribe` for side effects.
    */
    const { store, ...listBoxStore } = useListBox<HTMLDivElement>({
      state: selected,
      defaultState: defaultSelected,
      defaultStateFallback: null,
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
    
    /* virtualItemKeys
    // Keep the `virtualItemKeys` prop in sync with the store
    React.useEffect(() => {
      return store.subscribe(state => {
        if (state.virtualItemKeys !== virtualItemKeys) {
          state.setVirtualItemKeys(virtualItemKeys);
        }
      });
    }, [store, virtualItemKeys]);
    */
    
    /* formatItemKey
    React.useEffect(() => {
      return store.subscribe((state, prevState) => {
        if (state.selectedItem !== prevState.selectedItem && state.selectedItem !== null) {
          const itemKey = state.selectedItem;
          const label: string = formatItemLabel?.(itemKey)
            ?? state._internalItemsRegistry.get(itemKey)?.itemRef.current?.textContent
            ?? itemKey;
          const selectedItem: null | ItemDetails = state.selectedItem === null ? null : {
            itemKey,
            label,
          };
          
          onSelect?.(itemKey, selectedItem);
        }
      });
    }, [store, onSelect, formatItemLabel]);
    */
    
    // Note: WCAG requires at least one element with `role="option"` (or "group") in a `role="listbox"`. If there are
    // no options, then we should not render a `role="listbox"`.
    // https://github.com/dequelabs/axe-core/issues/383
    // https://github.com/dequelabs/axe-core/issues/2339
    // We can instead just render a normal (`role="presentation"`) element, see for example how it's done in MUI:
    // https://mui.com/material-ui/react-autocomplete/#combo-box
    const ariaProps = {
      role: isEmpty ? undefined : 'listbox',
      'aria-label': isEmpty ? undefined : label,
      'aria-busy': isEmpty ? undefined : isLoading,
      'aria-describedby': isEmpty ? `${id}-empty-placeholder` : undefined,
    };
    
    // Delegate 'Enter' key to the hidden input for form submissions
    const hiddenInputRef = React.useRef<React.ComponentRef<typeof HiddenSelectedState>>(null);
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        const form = hiddenInputRef.current?.form;
        if (form) {
          // Submit the form (after a timeout to allow the `<input>` to be updated in response to the Enter key event)
          window.setTimeout(() => { form.requestSubmit(); }, 0);
        }
      }
    }, []);
    
    return (
      <ListBoxConfigContext value={listBoxConfigContext}>
        <listBoxStore.Provider value={listBoxStore.context}>
          <div
            {...mergeProps(
              scrollerProps,
              focusGroupProps,
              ariaProps,
              listBoxStore.props,
              {
                tabIndex: undefined, // Do not make the listbox focusable, use a roving tabindex instead
                onKeyDown: handleKeyDown,
                className: cx(
                  'bk',
                  { [cl['bk-list-box']]: !unstyled },
                  { [cl['bk-list-box--empty']]: isEmpty },
                  { [cl['bk-list-box--size-shrink']]: size === 'shrink' },
                  { [cl['bk-list-box--size-small']]: size === 'small' },
                  { [cl['bk-list-box--size-medium']]: size === 'medium' },
                  { [cl['bk-list-box--size-large']]: size === 'large' },
                ),
              },
              propsRest,
            )}
          >
            {typeof name === 'string' &&
              <HiddenSelectedState ref={hiddenInputRef} form={form} name={name} {...inputProps}/>
            }
            
            {children}
            
            {!isLoading && isEmpty && placeholderEmpty !== false &&
              <EmptyPlaceholder id={`${id}-empty-placeholder`}>{placeholderEmpty}</EmptyPlaceholder>
            }
            {isLoading && <LoadingSpinner/>}
          </div>
        </listBoxStore.Provider>
      </ListBoxConfigContext>
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
