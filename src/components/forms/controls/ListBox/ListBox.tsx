/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, mergeCallbacks } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { useScroller } from '../../../../layouts/util/Scroller.tsx';

import { type IconName, Icon as BkIcon } from '../../../graphics/Icon/Icon.tsx';
import { Button } from '../../../actions/Button/Button.tsx';

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

import cl from './ListBox.module.scss';


/*
References:
- https://www.w3.org/WAI/ARIA/apg/patterns/listbox
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
- https://react-spectrum.adobe.com/react-spectrum/ListBox.html
- https://www.radix-ui.com/primitives/docs/components/select
*/

export { type ItemKey, type ItemDef, type ItemDetails, ListBoxContext, useListBoxItem };
export { cl as ListBoxClassNames };


type ListBoxIcon = React.ComponentType<Pick<React.ComponentProps<typeof BkIcon>, 'icon' | 'className' | 'decoration'>>;


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
  onSelect?: undefined | (() => void),
  
  /** Custom icon component. */
  Icon?: undefined | ListBoxIcon,
};
/**
 * A list box item that can be selected.
 */
export const Option = (props: OptionProps) => {
  const { itemKey, label, icon, iconDecoration, onSelect, Icon = BkIcon, ...propsRest } = props;
  
  const itemRef = React.useRef<React.ComponentRef<typeof Button>>(null);
  const itemDef = React.useMemo<ItemWithKey>(() => ({ itemKey, itemRef, isContentItem: true }), [itemKey]);
  
  const { id, disabled, isFocused, isSelected, requestSelection } = useListBoxItem(itemDef);
  const isNonactive = propsRest.disabled || propsRest.nonactive || disabled;
  
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
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
        { [cl['bk-list-box__item--disabled']]: isNonactive },
        cl['bk-list-box__item--option'],
        propsRest.className,
      )}
      // See: https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets#grouping_controls
      disabled={false} // Use `nonactive` for disabled state, so that we still allow focus
      nonactive={isNonactive}
      onPress={handlePress}
    >
      {icon &&
        <Icon
          icon={icon}
          decoration={iconDecoration !== 'highlight' ? undefined : { type: 'background-circle' }}
          className={cx(
            cl['bk-list-box__item__icon'],
            { [cl['bk-list-box__item__icon--highlight']]: iconDecoration === 'highlight' },
          )}
        />
      }
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
  const { itemKey, label, icon, sticky = 'start', Icon = BkIcon, ...propsRest } = props;
  
  return (
    <span
      data-item-key={itemKey}
      {...propsRest}
      className={cx(
        cl['bk-list-box__item'],
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
  const { itemKey, itemPos, label, icon, sticky = false, onActivate, Icon = BkIcon, ...propsRest } = props;
  
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
        cl['bk-list-box__item'],
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

export type ListBoxProps = Omit<ComponentProps<'div'>, 'onSelect'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** An accessible name for this listbox menu. Required. */
  label: string,
  
  /** The default option to select. Only relevant for uncontrolled usage (`selected` is `undefined`). */
  defaultSelected?: undefined | ItemKey,

  /** The option to select. If `undefined`, this component will be considered uncontrolled. */
  selected?: undefined | null | ItemKey,
  
  /** Event handler to be called when the selected option state changes. */
  onSelect?: undefined | ((selectedItem: null | ItemDetails) => void),
  
  /** Whether the list box is disabled or not. Default: false. */
  disabled?: undefined | boolean,
  
  /** The machine readable name of the list box control, used as part of `<form>` submission. */
  name?: undefined | string,
  
  /** A placheholder text message to display when there are no items in the list. */
  placeholderEmpty?: undefined | React.ReactNode,
  
  /** The ID of the `<form>` element to associate this list box with. Optional. */
  form?: undefined | string,
  
  /** Any additional props to apply to the internal `<input type="hidden"/>`. */
  inputProps?: undefined | Omit<React.ComponentProps<'input'>, 'value' | 'onChange'>,
  
  /** Render the given item key as a string label. If not given, will use the item element's text value. */
  formatItemLabel?: undefined | ((itemKey: ItemKey) => string),
  
  /** If the list is virtually rendered, `virtualItemKeys` should be provided with the full list of item keys. */
  virtualItemKeys?: undefined | null | VirtualItemKeys,
};

type HiddenSelectedStateProps = Pick<ListBoxProps, 'name' | 'form' | 'inputProps'> & {
  ref: React.Ref<React.ComponentRef<'input'>>,
};
/** Hidden input, so that this component can be connected to a <form> element. */
const HiddenSelectedState = ({ ref, name, form, inputProps }: HiddenSelectedStateProps) => {
  const selectedItem = useListBoxSelector(s => s.selectedItem);
  const onChange = React.useCallback(() => {}, []);
  return (
    <input
      type="hidden"
      name={name}
      form={form}
      {...inputProps}
      ref={mergeRefs(ref, inputProps?.ref)}
      value={selectedItem ?? ''}
      onChange={onChange}
    />
  );
};

const EmptyPlaceholder = (props: React.ComponentProps<'div'>) => {
  return (
    <>
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
    </>
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
      selected = null,
      onSelect,
      disabled = false,
      name,
      placeholderEmpty = 'No items',
      form,
      inputProps,
      virtualItemKeys = null,
      formatItemLabel,
      ...propsRest
    } = props;
    
    const id = React.useId();
    const ref = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<React.ComponentRef<typeof HiddenSelectedState>>(null);
    const scrollerProps = useScroller();
    
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
    
    const listBoxState = listBox.store.getState();
    if (listBoxState.virtualItemKeys !== virtualItemKeys) {
      listBoxState.setVirtualItemKeys(virtualItemKeys);
    }
    
    const isEmpty = useListBoxSelector(state => state.isEmpty(), listBox.store);
    
    React.useEffect(() => {
      return listBox.store.subscribe((state, prevState) => {
        if (state.selectedItem !== prevState.selectedItem && state.selectedItem !== null) {
          const itemKey = state.selectedItem;
          const label: string = formatItemLabel?.(itemKey)
            ?? state._internalItemsRegistry.get(itemKey)?.itemRef.current?.textContent
            ?? itemKey;
          const selectedItem: null | ItemDetails = state.selectedItem === null ? null : {
            itemKey,
            label,
          };
          
          onSelect?.(selectedItem);
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
      'aria-busy': false,
    } as const;
    
    return (
      <listBox.Provider>
        <div
          {...scrollerProps}
          tabIndex={undefined} // Do not make the listbox focusable, use a roving tabindex instead
          {...ariaProps}
          {...propsRest}
          {...listBox.props}
          ref={mergeRefs(ref, props.ref)}
          onKeyDown={mergeCallbacks([handleKeyDown, listBox.props.onKeyDown, propsRest.onKeyDown])}
          onToggle={mergeCallbacks([listBox.props.onToggle, props.onToggle])}
          className={cx(
            scrollerProps.className,
            'bk',
            { [cl['bk-list-box']]: !unstyled },
            { [cl['bk-list-box--empty']]: isEmpty },
            listBox.props.className,
            propsRest.className,
          )}
        >
          {typeof name === 'string' && <HiddenSelectedState ref={inputRef} name={name} form={form}/>}
          {children}
          {isEmpty && <EmptyPlaceholder id={`${id}_empty-placeholder`}>{placeholderEmpty}</EmptyPlaceholder>}
        </div>
      </listBox.Provider>
    );
  },
  {
    EmptyPlaceholder,
    Option,
    Header,
    Action,
    FooterAction,
    FooterActions,
  },
);
