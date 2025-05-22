/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeCallbacks, mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { useDebounce } from '../../../util/hooks/useDebounce.ts';

import {
  type UseFloatingElementOptions,
  useFloatingElement,
} from '../../util/overlays/floating-ui/useFloatingElement.tsx';

import * as ListBoxMulti from '../../forms/controls/ListBoxMulti/ListBoxMulti.tsx';

import { MenuProviderClassNames } from '../MenuProvider/MenuProvider.tsx';


export type ItemDetails = ListBoxMulti.ItemDetails;
export type ItemKey = ListBoxMulti.ItemKey;

export type MenuMultiProviderRef = {
  setIsOpen: (open: boolean) => void,
  isOpen: boolean,
  floatingEl: null | HTMLElement,
};

type ListBoxMultiProps = ComponentProps<typeof ListBoxMulti.ListBoxMulti>;

export type AnchorRenderArgs = {
  props: (userProps?: undefined | React.HTMLProps<Element>) => Record<string, unknown>,
  open: boolean,
  requestOpen: () => void, // FIXME: better naming
  close: () => void,
  selectedOptions: Map<ItemKey, ItemDetails>,
};
export type ItemsRenderArgs = {
  close: () => void,
};

export type MenuMultiProviderProps = Omit<ListBoxMultiProps, 'ref' | 'children' | 'label'> & {
  // ---
  // TEMP
  
  /** A React ref to control the menu provider imperatively. */
  ref?: undefined | React.Ref<null | MenuMultiProviderRef>,
  
  /** For controlled open state. */
  open?: boolean,

  /** When controlled, callback to set state. */
  onOpenChange?: (isOpen: boolean) => void,

  /** (optional) Use an existing DOM node as the positioning anchor. */
  anchorRef?: React.RefObject<HTMLElement | null>,
  
  // END TEMP
  // ---
  
  
  
  /** An accessible name for this menu provider. Required. */
  label: string,
  
  /**
  * The content to render, which should contain the anchor. This should be a render prop which takes props to
  * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
  */
  children?: ((args: AnchorRenderArgs) => React.ReactNode) | React.ReactNode,
  
  /** The menu items. */
  items: React.ReactNode | ((args: ItemsRenderArgs) => React.ReactNode),
  
  /** The accessible role of the menu. */
  role?: undefined | UseFloatingElementOptions['role'],
  
  /** The action that should trigger the menu to open. */
  action?: undefined | UseFloatingElementOptions['action'],
  
  /**
   * The kind of keyboard interactions to include:
   * - 'none': No keyboard interactions set.
   * - 'form-control': Appropriate keyboard interactions for a form control (e.g. Enter should trigger submit).
   * - 'default': Acts as a menu button [1] (e.g. Enter will activate the popover).
   *   [1] https://www.w3.org/WAI/ARIA/apg/patterns/menu-button
   */
  keyboardInteractions?: undefined | UseFloatingElementOptions['keyboardInteractions'],
  
  /** Override the default placement */
  placement?: undefined | UseFloatingElementOptions['placement'],
  
  /** Offset size for the menu relative to the anchor. */
  offset?: undefined | UseFloatingElementOptions['offset'],
  
  /** Enable more precise tracking of the anchor, at the cost of performance. */
  enablePreciseTracking?: undefined | UseFloatingElementOptions['enablePreciseTracking'],
};
/**
 * Provider for a menu overlay that is triggered by (and positioned relative to) some anchor element.
 */
export const MenuMultiProvider = Object.assign(
  (props: MenuMultiProviderProps) => {
    const {
      label,
      children,
      items,
      selected,
      onSelect,
      role,
      action,
      keyboardInteractions,
      placement = 'bottom',
      offset = 8,
      enablePreciseTracking,
      
      ref: forwardRef,
      open: controlledOpen,
      onOpenChange: controlledOnOpenChange,
      anchorRef: anchorRefSeparate,
      
      ...propsRest
    } = props;
    
    const anchorRef = React.useRef<HTMLElement>(null);
    const listBoxRef = React.useRef<React.ComponentRef<typeof ListBoxMulti.ListBoxMulti>>(null);
    const listBoxId = `listbox-${React.useId()}`;
    
    const {
      refs,
      placement: placementEffective,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      isOpen,
      setIsOpen,
    } = useFloatingElement({
      role,
      action,
      keyboardInteractions,
      placement,
      offset,
      floatingUiFlipOptions: {
        fallbackAxisSideDirection: 'none',
        fallbackStrategy: 'initialPlacement',
      },
      
      // TEMP
      floatingUiOptions: {
        ...(
          typeof controlledOpen !== 'undefined' ?
            {
              open: controlledOpen,
              ...(
                typeof controlledOnOpenChange !== 'undefined' ?
                  { onOpenChange: controlledOnOpenChange } : {}
              ),

            } : {}
        ),
      },
      // END TEMP
    });
    
    const [shouldMountMenu] = useDebounce(isOpen, isOpen ? 0 : 1000);
    
    const selectedLabelsRef = React.useRef<Map<ItemKey, string>>(new Map());
    const selectedOptionsWithDetails = React.useCallback((itemKeys: Set<ItemKey>): Map<ItemKey, ItemDetails> => {
      return new Map([...itemKeys].map(itemKey => {
        const label = selectedLabelsRef.current.get(itemKey) ?? '';
        return [itemKey, { itemKey, label }];
      }));
    }, []);
    
    const [selectedOptionsInternal, setSelectedOptionsInternal] = React.useState<Set<ItemKey>>(new Set());
    const selectedOptions = typeof selected !== 'undefined' ? selected : selectedOptionsInternal;
    const setSelectedOptions = React.useCallback((itemKeys: Set<ItemKey>) => {
      if (typeof selected === 'undefined') {
        setSelectedOptionsInternal(itemKeys);
      }
      
      onSelect?.(selectedOptionsWithDetails(itemKeys));
    }, [selected, selectedOptionsWithDetails, onSelect]);
    
    const toggleCause = React.useRef<null | 'ArrowUp' | 'ArrowDown'>(null);
    const handleAnchorKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        toggleCause.current = event.key; // Store for later use in `handleToggle`
        event.preventDefault(); // Prevent scrolling
        setIsOpen(true);
        
        if (action === 'focus') {
          const listBoxElement = listBoxRef.current;
          if (!listBoxElement) { return; }
          
          if (event.key === 'ArrowDown') {
            listBoxElement._bkListBoxFocusFirst();
          } else if (event.key === 'ArrowUp') {
            listBoxElement._bkListBoxFocusLast();
          }
        }
      }
    }, [setIsOpen, action]);
    
    // Note: memoize this, so that the anchor does not get rerendered every time the floating element position changes
    const anchor = React.useMemo(() => {
      // FIXME: make `React.HTMLProps<Element>` generic, since not all component props extend from this type
      const anchorProps: AnchorRenderArgs['props'] = (userProps?: undefined | React.HTMLProps<Element>) => {
        const userPropsRef: undefined | string | React.Ref<Element> = userProps?.ref ?? undefined;
        if (typeof userPropsRef === 'string') {
          // We can't merge refs if one of the refs is a string
          console.error(`Failed to render MenuMultiProvider, due to use of legacy string ref`);
          return (userProps ?? {}) as Record<string, unknown>;
        }
        
        const props = getReferenceProps(userProps);
        return {
          ...props,
          ref: userPropsRef ? mergeRefs(anchorRef, userPropsRef, refs.setReference) : refs.setReference,
          'aria-controls': listBoxId,
          'aria-haspopup': 'listbox',
          'aria-expanded': isOpen,
          // biome-ignore lint/suspicious/noExplicitAny: `onKeyDown` should be a function here
          onKeyDown: mergeCallbacks([props.onKeyDown as any, handleAnchorKeyDown]),
        };
      };
      
      if (typeof children === 'function') {
        return children({
          props: anchorProps,
          open: isOpen,
          requestOpen: () => { setIsOpen(true); },
          close: () => { setIsOpen(false); },
          selectedOptions: selectedOptionsWithDetails(selectedOptions),
        });
      }
      
      // If a render prop is not used, try to attach it to the element directly.
      // NOTE: `cloneElement` is marked as a legacy function by React. Recommended is to use a render prop instead.
      if (!React.isValidElement(children)) {
        return <span {...anchorProps()}>{children}</span>;
      }
      if (React.Children.count(children) === 1) {
        return React.cloneElement(children, anchorProps(children.props as React.HTMLProps<Element>));
      }
      
      console.error(`Invalid children passed to MenuMultiProvider, expected a render prop or single child element.`);
      return children;
    }, [
      children,
      getReferenceProps,
      handleAnchorKeyDown,
      isOpen,
      setIsOpen,
      listBoxId,
      refs.setReference,
      selectedOptions,
    ]);
    
    const handleSelect = React.useCallback((_key: null | ListBoxMulti.ItemKey, itemDetails: null | ListBoxMulti.ItemDetails) => {
      selectedLabelsRef.current = itemDetails?.label ?? null;
      setSelectedOption(itemDetails?.itemKey ?? null);
      
      // Note: add a slight delay before closing, to make it less jarring (and allow "select" animations to complete)
      window.setTimeout(() => {
        const previousActiveElement = previousActiveElementRef.current;
        
        if (previousActiveElement) {
          previousActiveElement.focus({
            // @ts-ignore Supported in some browsers (e.g. Firefox).
            focusVisible: false,
          });
        }
        
        // Note: do *not* close the menu automatically after select in multi-select mode
        //setIsOpen(false);
      }, 150);
    }, [setIsOpen, setSelectedOption, action]);
    
    // Focus management (focus on open + restore focus on close)
    const previousActiveElementRef = React.useRef<null | HTMLElement>(null);
    const handleToggle = React.useCallback((event: React.ToggleEvent) => {
      const listBoxElement = listBoxRef.current;
      if (!listBoxElement) { return; }
      
      if (event.oldState === 'closed' && event.newState === 'open') {
        if (document.activeElement instanceof HTMLElement) {
          previousActiveElementRef.current = document.activeElement;
        }
        
        // For click actions, move focus to the list box upon toggling
        if (action !== 'click') { return; }
        
        if (toggleCause.current === 'ArrowDown') {
          listBoxElement._bkListBoxFocusFirst();
        } else if (toggleCause.current === 'ArrowUp') {
          listBoxElement._bkListBoxFocusLast();
        } else {
          listBoxElement.focus();
        }
        toggleCause.current = null;
      } else if (event.oldState === 'open' && event.newState === 'closed') {
        const previousActiveElement = previousActiveElementRef.current;
        
        if (previousActiveElement && listBoxElement.matches(':focus-within')) {
          previousActiveElement.focus({
            // @ts-ignore Supported in some browsers (e.g. Firefox).
            focusVisible: false,
          });
        }
      }
    }, [action]);
    
    const handleMenuKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        const selectedOptionDetails = selectedOption === null
          ? null
          : { itemKey: selectedOption, label: (selectedLabelsRef.current ?? '') };
        handleSelect(selectedOption, selectedOption === null ? null : selectedOptionDetails);
      }
      
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }, [selectedOption, handleSelect, setIsOpen]);
    
    const renderMenu = () => {
      const floatingProps = getFloatingProps({
        popover: 'manual',
        style: floatingStyles,
        ...propsRest,
        className: cx(MenuProviderClassNames['bk-menu-provider__list-box'], propsRest.className),
        onKeyDown: mergeCallbacks([propsRest.onKeyDown, handleMenuKeyDown]),
      });
      
      return (
        <ListBoxMulti.ListBoxMulti
          label={label}
          {...floatingProps}
          ref={mergeRefs<React.ComponentRef<typeof ListBoxMulti.ListBoxMulti>>(
            listBoxRef,
            refs.setFloating,
            floatingProps.ref as React.Ref<React.ComponentRef<typeof ListBoxMulti.ListBoxMulti>>,
            //propsRest.ref,
          )}
          id={listBoxId}
          selected={selectedOption}
          onSelect={handleSelect}
          onToggle={handleToggle}
          data-placement={placementEffective}
        >
          {typeof items === 'function' ? items({ close: () => { setIsOpen(false); } }) : items}
        </ListBoxMulti.ListBoxMulti>
      );
    };
    
    
    // TEMP
    // keep internal state in sync with the controlled prop
    React.useEffect(() => {
      if (controlledOpen !== undefined) {
        setIsOpen(controlledOpen);
      }
    }, [controlledOpen, setIsOpen]);
    
    // Use external element as the reference, if provided
    React.useLayoutEffect(() => {
      if (anchorRefSeparate?.current) {
        refs.setReference(anchorRefSeparate.current);
      }
    }, [anchorRefSeparate?.current, refs.setReference]);
    
    const menuProviderRef = React.useMemo<MenuMultiProviderRef>(() => ({
      isOpen,
      setIsOpen,
      get floatingEl() {
        return refs.floating.current;
      },
    }), [isOpen, setIsOpen, refs.floating]);
    
    React.useImperativeHandle(forwardRef, () => menuProviderRef, [menuProviderRef]);
    // END TEMP
    
    return (
      <>
        {anchor}
        {shouldMountMenu && renderMenu()}
      </>
    );
  },
  {
    Option: ListBoxMulti.Option,
    Action: ListBoxMulti.Action,
    Header: ListBoxMulti.Header,
    FooterActions: ListBoxMulti.FooterActions,
  },
);
