/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';
import { useScroller } from '../../../../layouts/util/Scroller.tsx';
import { useFocusGroup } from '../../../../util/hooks/useFocusGroup.ts';
import { useStore } from 'zustand';

import { H6 } from '../../../../typography/Heading/Heading.tsx';
import { type IconName, type IconDecoration, Icon as BkIcon } from '../../../graphics/Icon/Icon.tsx';
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
// Group
//

export type GroupProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** An accessible name for this group. */
  label: string,
  
  /** A heading to display. Optional. If not defined, the `label` will be displayed. */
  heading?: undefined | React.ReactNode,
  
  /** Whether the action should stick on scroll. Default: 'start'. */
  sticky?: undefined | false | 'start',
  
  /** An icon to be displayed before the label. */
  icon?: undefined | IconName,
  
  /** Custom icon component. */
  Icon?: undefined | ListBoxIcon,
};
/**
 * A group element that can contain list options or other groups.
 */
export const Group = (props: GroupProps) => {
  const { unstyled, label, heading, icon, sticky = 'start', Icon = BkIcon, ...propsRest } = props;
  
  const id = React.useId();
  const ariaProps = {
    'aria-label': heading === null ? label : undefined,
    'aria-labelledby': heading === null ? undefined : `${id}-heading`,
  };
  
  return (
    // biome-ignore lint/a11y/useSemanticElements: Using `role="group"` instead of `<fieldset>`.
    <section
      role="group"
      {...mergeProps(ariaProps, propsRest)}
      className={cx(
        { [cl['bk-list-box__group']]: !unstyled },
        propsRest.className,
      )}
    >
      {heading !== null &&
        <H6 unstyled // FIXME: hardcoded level 6 heading
          id={`${id}-heading`}
          className={cx(
            cl['bk-list-box__item'],
            cl['bk-list-box__item--heading'],
          )}
        >
          {icon && <Icon icon={icon} className={cl['bk-list-box__item__icon']}/>}
          {typeof heading === 'undefined' ? label : heading}
        </H6>
      }
      
      {propsRest.children}
    </section>
  );
};


//
// Static item
//

type ItemStaticProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** Whether the item should stick on scroll. Default: `false`. */
  sticky?: undefined | false | 'start',
};
/**
 * A static item, that can be customized for any presentational content (not affected by store state).
 * 
 * Important: since this is inside a `role="listbox"`, the static content should be presentational only. There should
 * be no interactive elements or other semantic content, only presentational content.
 */
export const ItemStatic = ({ unstyled, sticky = false, ...propsRest }: ItemStaticProps) => (
  <div
    role="none"
    {...propsRest}
    className={cx(
      { [cl['bk-list-box__item']]: !unstyled },
      cl['bk-list-box__item--static'],
      { [cl['bk-list-box__item--sticky-start']]: sticky === 'start' },
      propsRest.className,
    )}
  />
);


//
// Option item
//

type ButtonPropsOmit = 'kind' | 'variant' | 'onSelect';
type ItemOptionProps = Omit<ComponentProps<typeof Button>, ButtonPropsOmit> & {
  /** A unique identifier for this option. */
  itemKey: ItemKey,
  
  /** How to decorate the icon. Default: undefined (i.e. no decoration). */
  iconDecoration?: undefined | 'highlight',
};
/**
 * A list box option (can be selected by the user).
 */
export const ItemOption = React.memo((props: ItemOptionProps) => {
  // Note: use `memo()` so that children don't rerendered on state change, in the case that:
  // - The consumer uses this component with controlled state
  // - The `children` prop on consumer side is not memoized/static (usually the case)
  
  const { unstyled, itemKey, className, iconDecoration, ...propsRest } = props;
  
  const { disabled } = useListBoxConfigContext();
  const { selected, requestSelected, props: itemProps } = useListBoxItem({ itemKey });
  
  const isNonactive = propsRest.disabled || propsRest.nonactive || disabled;
  const handlePress = React.useCallback(() => {
    if (isNonactive) { return; }
    requestSelected();
  }, [isNonactive, requestSelected]);
  
  const iconProps = React.useMemo<undefined | { decoration: IconDecoration }>(() => {
    if (iconDecoration === 'highlight') {
      return { decoration: { type: 'background-circle' } };
    }
  }, [iconDecoration]);
  
  return (
    <Button
      variant="basic"
      wrap={false}
      role="option" // Already set automatically by `focusgroup`
      //focusgroupstart={isSelected ? '' : undefined} // Not needed, rely on `focusgroup` memory instead
      {...mergeProps(
        itemProps,
        {
          onPress: handlePress,
          iconProps,
        },
        }
        propsRest,
        {
          className: cx(
            { [cl['bk-list-box__item']]: !unstyled },
            { [cl['bk-list-box__item--nonactive']]: isNonactive },
            { [cl['bk-list-box__item--icon-highlight']]: iconDecoration === 'highlight' },
            cl['bk-list-box__item--option'],
            className,
          ),
        },
      )}
      aria-selected={selected}
      disabled={false} // Never use `disabled`, only use `nonactive`, so that we still allow focus
      nonactive={isNonactive}
    />
  );
});


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
    
    NOTE: try to avoid the use of `useStore` or other hooks that would cause a re-render when the store is updated.
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
          window.setTimeout(form.requestSubmit.bind(form), 0);
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
    Group,
    Static: ItemStatic,
    Option: ItemOption,
  },
);
