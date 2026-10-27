/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeProps, mergeRefs } from '../../../util/reactUtil.ts';
import { useControllableStateFromProps } from '../../../util/hooks/useControllableState.ts';

// Components
import { type ItemKey, type SelectedMultiState, MenuSelectMulti } from '../Menu/Menu.tsx';
import {
  type OpenStateProps,
  type OpenChangeEvent,
  type UseFloatingMenuOptions,
  type UseFloatingMenuResult,
  useFloatingMenu,
} from '../../util/overlays/menu/menuUtil.tsx';

// Styles
import { MenuProviderClassNames as cl } from '../MenuProvider/MenuProvider.tsx';


export type { ItemKey };

type MenuSelectMultiProps = React.ComponentProps<typeof MenuSelectMulti>;

export type MenuMultiProviderRef = {
  open: boolean,
  requestOpenChange: (event: OpenChangeEvent) => void,
  selected: SelectedMultiState,
  requestSelectedChange: (selected: SelectedMultiState) => void,
  //anchorEl: null | HTMLElement,
  //floatingEl: null | HTMLElement,
};



type UseMenuKeyboardNavigationOptions = {
  setIsOpen: (open: boolean) => void,
  menuRef: React.RefObject<null | React.ComponentRef<typeof MenuSelectMulti>>,
};
export const useMenuKeyboardNavigation = (props: UseMenuKeyboardNavigationOptions) => {
  const { setIsOpen } = props;
  
  const onMenuKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // On "enter", select the currently focused item and close the menu
    // Note: `Menu` already takes care of the selection of the item itself, just need to close.
    if (event.key === 'Enter') { setIsOpen(false); }
    
    // On "escape", close the menu
    // Note: already handled by `useFloatingElement`
    //if (event.key === 'Escape') { setIsOpen(false); }
  }, [setIsOpen]);
  
  return { onMenuKeyDown };
};


/**
 * MENU ANCHOR RENDERING
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type BaseAnchorRenderArgs = {
  props: (userProps?: undefined | React.HTMLProps<Element>) => Record<string, unknown>,
  open: boolean,
  requestOpen: () => void,
  close: () => void,
};
type UseMenuAnchorOptions<RenderArgs> = {
  children?: undefined | React.ReactNode | ((args: RenderArgs) => React.ReactNode),
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  menuId: string,
  getReferenceProps: UseFloatingMenuResult['getReferenceProps'],
  refs: UseFloatingMenuResult['refs'],
  onKeyDown: (event: React.KeyboardEvent) => void,
  getRenderArgs: (args: BaseAnchorRenderArgs) => RenderArgs,
};
export const useMenuAnchor = <RenderArgs extends BaseAnchorRenderArgs>(options: UseMenuAnchorOptions<RenderArgs>) => {
  const {
    children,
    isOpen,
    setIsOpen,
    menuId,
    getReferenceProps,
    refs,
    onKeyDown,
    getRenderArgs,
  } = options;
  
  // Note: memoize this, so that the anchor does not get rerendered every time the floating element position changes
  const anchor = React.useMemo(() => {
    // FIXME: make `React.HTMLProps<Element>` generic, since not all component props extend from this type
    const anchorProps = (userProps?: undefined | React.HTMLProps<Element>) => {
      const userPropsRef = userProps?.ref;
      
      if (typeof userPropsRef === 'string') {
        console.error('Failed to render MenuProvider, due to use of legacy string ref');
        return userProps as Record<string, unknown>;
      }
      
      const props = getReferenceProps(userProps);
      const ref = mergeRefs(
        userPropsRef,
        refs.setReference,
        props.ref as React.Ref<Element>,
      );
      
      return {
        ...props,
        ref,
        'aria-controls': menuId,
        'aria-haspopup': 'listbox',
        'aria-expanded': isOpen,
        // biome-ignore lint/suspicious/noExplicitAny: `onKeyDown` should be a function here
        onKeyDown: mergeCallbacks([props.onKeyDown as any, onKeyDown]),
        // biome-ignore lint/suspicious/noExplicitAny: `onBlur` should be a function here
        onBlur: mergeCallbacks([userProps?.onBlur, props.onBlur as any]),
      };
    };
    
    if (typeof children === 'function') {
      const baseArgs: BaseAnchorRenderArgs = {
        props: anchorProps,
        open: isOpen,
        requestOpen: () => { setIsOpen(true); },
        close: () => { setIsOpen(false); },
      };
      
      return children(getRenderArgs(baseArgs));
    }
    
    // If no `children` are defined, the consumer may be using an imperative handler rather than an anchor.
    // Do not render any anchor in this case.
    if (!children) { return null; }
    
    if (!React.isValidElement(children)) {
      // Edge case: if `children` is defined but not a valid element, then wrap it in an element ourselves.
      // NOTE: must be an interactive element, like a `<button>`, in order for this to be valid in terms of ARIA.
      return <button {...anchorProps()}>{children}</button>;
    }
    
    // If a single element is given, apply the anchor props on that element. Note: the consumer must ensure
    // that this element is a valid interactive element, like a `<button>`.
    // NOTE: `cloneElement` is marked as a legacy function by React. Recommended is to use a render prop instead.
    return React.cloneElement(children, anchorProps(children.props as React.HTMLProps<Element>));
  }, [
    children,
    getReferenceProps,
    isOpen,
    menuId,
    onKeyDown,
    refs.setReference,
    setIsOpen,
    getRenderArgs,
  ]);
  
  return { anchor };
};

// MENU SELECT HANDLER
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Convert the given (single) item key to the component state representation, such that:
 * - `undefined` means uncontrolled component state.
 * - `null` means controlled component state, but there is no selected value.
 * - `ItemKey` means a single selected item state.
 */
export const selectionStateFromItemKey = (itemKey: undefined | null | ItemKey): undefined | Set<ItemKey> => {
  if (typeof itemKey === 'undefined') { return undefined; }
  
  return typeof itemKey === 'string'
    ? new Set([itemKey])
    : new Set([]);
};


/**
 * MENU PROVIDER
 * Provider for a menu overlay that is triggered by (and positioned relative to) some anchor element.
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type AnchorRenderArgs = BaseAnchorRenderArgs & {
  selectedOptions: SelectedMultiState,
};
export type MenuMultiProviderProps =
  Omit<MenuSelectMultiProps, 'ref' | 'children' | 'label' | 'size'>
  & OpenStateProps
  & {
    /** A React ref to control the menu provider imperatively. */
    ref?: undefined | React.Ref<null | MenuMultiProviderRef>,
    
    /** Use an existing DOM node as the positioning anchor. Optional. */
    anchorRef?: undefined | React.RefObject<null | HTMLElement>,
    
    /** An accessible name for this menu provider. Required. */
    label: string,
    
    /**
    * The content to render, which should contain the anchor. This should be a render prop which takes props to
    * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
    */
    children?: undefined | ((args: AnchorRenderArgs) => React.ReactNode) | React.ReactNode,
    
    /** The menu items. */
    items: React.ReactNode | ((args: { close: () => void }) => React.ReactNode),
    
    /** The accessible role of the menu. */
    role?: undefined | UseFloatingMenuOptions['role'],
    
    /** The action that should trigger the menu to open. */
    triggerAction?: undefined | UseFloatingMenuOptions['triggerAction'],
    
    /** The (inline) size of the menu. */
    menuSize?: MenuSelectMultiProps['size'],
    
    /**
     * The kind of keyboard interactions to include:
     * - 'none': No keyboard interactions set.
     * - 'form-control': Appropriate keyboard interactions for a form control (e.g. Enter should trigger submit).
     * - 'default': Acts as a menu button [1] (e.g. Enter will activate the popover).
     *   [1] https://www.w3.org/WAI/ARIA/apg/patterns/menu-button
     */
    keyboardInteractions?: undefined | UseFloatingMenuOptions['keyboardInteractions'],
    
    /** Override the default placement */
    placement?: undefined | UseFloatingMenuOptions['placement'],
    
    /** Offset size for the menu relative to the anchor. */
    offset?: undefined | UseFloatingMenuOptions['offset'],
    
    /** Enable more precise tracking of the anchor, at the cost of performance. Default: `false`. */
    enablePreciseTracking?: undefined | UseFloatingMenuOptions['enablePreciseTracking'],
  };
export const MenuMultiProvider = Object.assign((props: MenuMultiProviderProps) => {
  const {
    defaultSelected,
    selected,
    onSelectedChange,
    open,
    defaultOpen,
    onOpenChange,
    
    ref,
    anchorRef,
    label,
    children,
    items,
    menuSize,
    
    // Floating element props
    role = 'menu',
    triggerAction,
    keyboardInteractions,
    placement,
    offset,
    enablePreciseTracking,
    
    ...propsRest
  } = props;
  
  const menuId = React.useId();
  const menuRef = React.useRef<React.ComponentRef<typeof MenuSelectMulti>>(null);
  
  // Track `selected` state
  const {
    state: selectedState,
    requestStateChange: requestSelectedChange,
  } = useControllableStateFromProps<SelectedMultiState>(
    {
      state: selected,
      defaultState: defaultSelected,
      onStateChange: onSelectedChange,
    },
    {
      debugName: 'MenuMultiProvider',
      propName: 'filter',
      defaultStateFallback: new Set(),
      stateFromEvent: state => state,
    },
  );
  
  const trackOpenChange = React.useCallback((event: OpenChangeEvent) => {
    // Timeout to wait for the menu to open
    setTimeout(() => {
      if (!event.open) { return; }
      
      if (event.reason === 'list-navigation-first') {
        menuRef.current?._bkFocusFirst();
      } else if (event.reason === 'list-navigation-last') {
        menuRef.current?._bkFocusLast();
      }
    }, 100);
  }, []);
  
  const {
    isMounted,
    isOpen: openState,
    requestOpenChange,
    refs,
    getReferenceProps,
    getFloatingProps,
    floatingStyles,
    placement: floatingPlacement,
  } = useFloatingMenu({
    role,
    popoverBehavior: 'manual',
    triggerAction,
    keyboardInteractions,
    placement,
    offset,
    enablePreciseTracking,
    open,
    onOpenChange: mergeCallbacks([onOpenChange, trackOpenChange]),
  });
  
  // Allow passing a ref to control the state of the menu imperatively
  React.useImperativeHandle(ref, () => ({
    open: openState,
    requestOpenChange,
    selected: selectedState,
    requestSelectedChange,
    // FIXME: also expose the element references?
    //get anchorEl() { return anchorRef.current; },
    //get floatingEl() { return floatingRef.current; },
  }), [openState, requestOpenChange, selectedState, requestSelectedChange]);
  
  
  // Keyboard navigation logic
  const setIsOpen = React.useCallback((open: boolean) => { // FIXME
    requestOpenChange({ open, forced: false, reason: undefined });
  }, [requestOpenChange]);
  const { onMenuKeyDown } = useMenuKeyboardNavigation({ setIsOpen, menuRef });
  
  
  //
  // Rendering
  //
  
  const getRenderArgs = React.useCallback((base: BaseAnchorRenderArgs): AnchorRenderArgs => ({
    ...base,
    selectedOptions: selectedState,
  }), [selectedState]);
  
  const onAnchorKeyDown = () => {}; // FIXME
  const { anchor } = useMenuAnchor({
    children,
    isOpen: openState,
    setIsOpen,
    menuId,
    getReferenceProps,
    refs,
    onKeyDown: onAnchorKeyDown,
    getRenderArgs,
  });
  
  // Use external element as the reference, if provided
  React.useLayoutEffect(() => {
    if (anchorRef?.current) {
      refs.setReference(anchorRef.current);
    }
  }, [anchorRef, refs]);
  
  const floatingProps = getFloatingProps({
    style: floatingStyles,
    className: cx(cl['bk-menu-provider__menu-list']),
  });
  
  const selectedFromInternalSelected = React.useMemo(() => {
    return new Set(selectedState.keys()); // 'null' for controlled
  }, [selectedState]);
  
  const handleSelect = React.useCallback((selectedKeys: Set<ItemKey>) => {
    requestSelectedChange(selectedKeys);
  }, [requestSelectedChange]);
  
  return (
    <>
      {anchor}
      {isMounted && (
        <MenuSelectMulti
          {...mergeProps(
            floatingProps,
            propsRest,
            {
              ref: mergeRefs<React.ComponentRef<typeof MenuSelectMulti>>(
                menuRef,
                refs.setFloating,
                floatingProps.ref as React.Ref<React.ComponentRef<typeof MenuSelectMulti>>,
              ),
              onKeyDown: onMenuKeyDown,
            },
          )}
          size={menuSize}
          label={label}
          selected={selectedFromInternalSelected}
          defaultSelected={defaultSelected}
          onSelectedChange={handleSelect}
          data-placement={floatingPlacement}
        >
          {typeof items === 'function'
            ? items({ close: () => { setIsOpen(false); } })
            : items
          }
        </MenuSelectMulti>
      )}
    </>
  );
}, {
    Option: MenuSelectMulti.Option,
    Static: MenuSelectMulti.Static,
    Action: MenuSelectMulti.Action,
    Link: MenuSelectMulti.Link,
    Segment: MenuSelectMulti.Segment,
    SegmentVirtual: MenuSelectMulti.SegmentVirtual,
    Group: MenuSelectMulti.Group,
    Footer: MenuSelectMulti.Footer,
  },
);
