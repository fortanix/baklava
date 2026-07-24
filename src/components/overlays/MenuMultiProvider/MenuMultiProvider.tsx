/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

// Utils
import { classNames as cx } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeProps, mergeRefs } from '../../../util/reactUtil.ts';
import {
  type UseFloatingElementOptions,
  UseFloatingElementResult,
  useFloatingElement,
} from '../../util/overlays/floating-ui/useFloatingElement.tsx';

// Components
import { type ItemKey, type SelectedMultiState, MenuSelectMulti } from '../Menu/Menu.tsx';

// Styles
import { MenuProviderClassNames as cl } from '../MenuProvider/MenuProvider.tsx';


export type { ItemKey };

type MenuSelectMultiProps = React.ComponentProps<typeof MenuSelectMulti>;

/**
 * FLOATING MENU + CONTROLLED OPTIONS
 * ---------------------------------------------------------------------------------------------------------------------
 */ 
type useFloatingMenuOptions = {
  /** The accessible role of the menu. */
  role?: undefined | UseFloatingElementOptions['role'],
  /** The action that should trigger the menu to open. */
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'],
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
  /** For controlled open state. */
  open?: undefined | boolean,
  /** When controlled, callback to set state. */
  onOpenChange?: undefined | ((open: boolean) => void),
  /** When controlled, callback to set state. */
  enablePreciseTracking?: undefined | UseFloatingElementOptions['enablePreciseTracking'],
};
export const useFloatingMenu = (options: useFloatingMenuOptions) => {
  const {
    role,
    triggerAction,
    keyboardInteractions,
    placement,
    offset,
    open,
    onOpenChange,
    enablePreciseTracking,
  } = options;
  
  const useFloatingElementResult = useFloatingElement({
    role,
    triggerAction: triggerAction ?? 'click',
    keyboardInteractions,
    placement: placement ?? 'bottom',
    offset: offset ?? 8,
    enablePreciseTracking,
    floatingUiFlipOptions: {
      fallbackAxisSideDirection: 'none',
      fallbackStrategy: 'initialPlacement',
    },
    floatingUiOptions: typeof open !== 'undefined'
        ? { open, ...(onOpenChange ? { onOpenChange } : {}) }
        : undefined,
  });

  return {
    ...useFloatingElementResult,
    // Use `useFloatingElementResult.isOpen` to update the internal state only when `open` is uncontrolled.
    // Otherwise, popover open state is fully managed by the parent.
    isOpen: open ?? useFloatingElementResult.isOpen,
    setIsOpen: onOpenChange ?? useFloatingElementResult.setIsOpen,
  };
};

/**
 * MENU OPEN CONTROL - CONTROLLED OR UNCONTROLLED OPEN
 * ---------------------------------------------------------------------------------------------------------------------
 */ 
type UseMenuOpenControlOptions = {
  setIsOpen: (open: boolean) => void,
  open?: undefined | boolean,
};
export const useMenuOpenControl = (options: UseMenuOpenControlOptions) => {
  const { setIsOpen, open } = options;

  // NOTE: This is temporary. Keep internal state in sync with the controlled prop
  React.useEffect(() => {
    if (typeof open !== 'undefined') { setIsOpen(open); }
  }, [open, setIsOpen]);
};

/**
 * MENU KEYBOARD NAVIGATION (ARROW-UP OR ARROW-DOWN)
 * ---------------------------------------------------------------------------------------------------------------------
 */
type UseMenuKeyboardNavigationOptions = {
  setIsOpen: (open: boolean) => void,
  menuRef: React.RefObject<null | React.ComponentRef<typeof MenuSelectMulti>>,
};
export const useMenuKeyboardNavigation = (props: UseMenuKeyboardNavigationOptions) => {
  const { setIsOpen, menuRef } = props;
  const toggleCauseRef = React.useRef<null | 'ArrowUp' | 'ArrowDown'>(null);

  const onAnchorKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

    toggleCauseRef.current = event.key;  // Store how the menu was opened for later use in `handleToggle`
    event.preventDefault(); // Prevent scrolling
    setIsOpen(true);

    // NOTE: need to wait until the list has actually opened
    // FIXME: need a more reliable way to do this (ref callback?)
    window.setTimeout(() => {
      const el = menuRef.current;
      if (!el) return;
      
      if (event.key === 'ArrowDown') {
        el._bkFocusFirst(); // FIXME: not working
      } else if (event.key === 'ArrowUp') {
        el._bkFocusLast();
      }
    }, 100);
  }, [setIsOpen, menuRef.current]);
  
  const onMenuKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // On "enter", select the currently focused item and close the menu
    // Note: `Menu` already takes care of the selection of the item itself, just need to close.
    if (event.key === 'Enter') { setIsOpen(false); }
    
    // On "escape", close the menu
    // Note: already handled by floating-ui
    //if (event.key === 'Escape') { setIsOpen(false); }
  }, [setIsOpen]);

  return { toggleCauseRef, onAnchorKeyDown, onMenuKeyDown };
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
type UseMenuAnchorProps<RenderArgs> = {
  children?: undefined | React.ReactNode | ((args: RenderArgs) => React.ReactNode),
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  menuId: string;
  getReferenceProps: UseFloatingElementResult['getReferenceProps'],
  refs: UseFloatingElementResult['refs'],
  onKeyDown: (e: React.KeyboardEvent) => void,
  getRenderArgs: (args: BaseAnchorRenderArgs) => RenderArgs,
};
export const useMenuAnchor = <RenderArgs extends BaseAnchorRenderArgs>(props: UseMenuAnchorProps<RenderArgs>) => {
  const {
    children,
    isOpen,
    setIsOpen,
    menuId,
    getReferenceProps,
    refs,
    onKeyDown,
    getRenderArgs,
  } = props;

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
        requestOpen: () => setIsOpen(true),
        close: () => setIsOpen(false),
      };

      return children(getRenderArgs(baseArgs));
    }

    // If no `children` are defined, the consumer may be using an imperative handler rather than an anchor.
    // Do not render any anchor in this case.
    if (!children) return null;

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

/**
 * MENU IMPERATIVE HANDLE
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type MenuProviderRef = {
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  floatingEl: null | HTMLElement,
};

type UseMenuImperativeRefOptions = {
  ref?: undefined | React.Ref<null | MenuProviderRef>,
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  floatingRef: UseFloatingElementResult['refs']['floating'],
};
export const useMenuImperativeRef = (options: UseMenuImperativeRefOptions) => {
  const {
    ref,
    isOpen,
    setIsOpen,
    floatingRef,
  } = options;
  
  React.useImperativeHandle(ref, () => ({
    isOpen,
    setIsOpen,
    get floatingEl() { return floatingRef.current; },
  }), [isOpen, setIsOpen, floatingRef]);
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

type UseMenuSelectHandlerOptions = {
  previousActiveElementRef: React.RefObject<null | HTMLElement>,
  setIsOpen: (open: boolean) => void;
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'];
  selected?: undefined | Set<string>,
  defaultSelected?: undefined | Set<string>,
  canCloseMenu?: undefined | boolean,
};
export const useMenuSelect = (options: UseMenuSelectHandlerOptions) => {
  const {
    previousActiveElementRef,
    setIsOpen,
    triggerAction = 'click',
    selected,
    defaultSelected,
    canCloseMenu = true,
  } = options;
  
  // If the 'selected' prop is provided, the component is treated as controlled.
  const isControlled = typeof selected !== 'undefined';
  // State 'internalSelected' stores the currently selected item keys.
  // When the menu provider is used in controlled mode, this state is kept
  // in sync with the `selected` prop.
  const [internalSelected, setInternalSelected] = React.useState<Set<ItemKey>>(() =>
    selected ?? defaultSelected ?? new Set()
  );
  
  React.useEffect(() => {
    if (isControlled) {
      // In controlled mode, keep internal state in sync with the parent-controlled value
      setInternalSelected(selected);
    }
  }, [isControlled, selected]);
  
  const handleInternalSelect = React.useCallback((selectedItems: SelectedMultiState) => {
    if (!isControlled) {
      // When not controlled by the parent, update the internal selection state directly
      setInternalSelected(selectedItems);
    }
    
    if (!canCloseMenu) { return; }

    window.setTimeout(() => {
      const previous = previousActiveElementRef.current;

      if (previous) {
        previous.focus({ focusVisible: false });

        if (previous instanceof HTMLInputElement) {
          // Move cursor to end
          const length = previous.value.length;
          previous.setSelectionRange(length, length);
        }
      }

      if (triggerAction !== 'focus') {
        setIsOpen(false);
      }
    }, 150);
  }, [
    triggerAction,
    setIsOpen,
    previousActiveElementRef,
    isControlled,
    canCloseMenu,
  ]);

  return {
    internalSelected,
    handleInternalSelect,
    setInternalSelected,
    isControlled,
  };
};

/**
 * MENU LISTBOX TOGGLE
 * ---------------------------------------------------------------------------------------------------------------------
 */
type UseMenuToggleOptions = {
  menuRef: React.RefObject<null | React.ComponentRef<typeof MenuSelectMulti>>,
  previousActiveElementRef: React.RefObject<null | HTMLElement>,
  action?: undefined | UseFloatingElementOptions['triggerAction'],
  toggleCauseRef?: undefined | React.RefObject<null | 'ArrowUp' | 'ArrowDown'>,
};
export const useMenuToggle = (options: UseMenuToggleOptions) => {
  const {
    menuRef,
    previousActiveElementRef,
    action,
    toggleCauseRef,
  } = options;

  const handleToggle = React.useCallback((event: React.ToggleEvent) => {
    const menuElement = menuRef.current;
    if (!menuElement) return;

    if (event.oldState === 'closed' && event.newState === 'open') {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElementRef.current = document.activeElement;
      }

      // For click actions, move focus to the list box upon toggling
      if (action !== 'click') return;

      if (toggleCauseRef?.current === 'ArrowDown') {
        menuElement._bkFocusFirst();
      } else if (toggleCauseRef?.current === 'ArrowUp') {
        menuElement._bkFocusLast();
      } else {
        menuElement.focus();
      }

      if (toggleCauseRef) {
        toggleCauseRef.current = null;
      }
    }

    if (event.oldState === 'open' && event.newState === 'closed') {
      const previousActiveElement = previousActiveElementRef.current;

      if (previousActiveElement && menuElement.matches(':focus-within')) {
        previousActiveElement.focus({ focusVisible: false });
      }
    }
  }, [action, menuRef, toggleCauseRef, previousActiveElementRef]);

  return { handleToggle };
}


/**
 * MENU PROVIDER
 * Provider for a menu overlay that is triggered by (and positioned relative to) some anchor element.
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type AnchorRenderArgs = BaseAnchorRenderArgs & {
  selectedOptions: SelectedMultiState,
};
export type MenuMultiProviderProps = Omit<MenuSelectMultiProps, 'ref' | 'children' | 'label' | 'size'> & {
  /** A React ref to control the menu provider imperatively. */
  ref?: undefined | React.Ref<null | MenuProviderRef>,
  /** For controlled open state. */
  open?: undefined | boolean,
  /** When controlled, callback to set state. */
  onOpenChange?: undefined | ((isOpen: boolean) => void),
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
  role?: undefined | UseFloatingElementOptions['role'],
  
  /** The action that should trigger the menu to open. */
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'],
  
  /** The (inline) size of the menu. */
  menuSize?: MenuSelectMultiProps['size'],
  
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
  
  /** Enable more precise tracking of the anchor, at the cost of performance. Default: `false`. */
  enablePreciseTracking?: undefined | UseFloatingElementOptions['enablePreciseTracking'],
};
export const MenuMultiProvider = Object.assign((props: MenuMultiProviderProps) => {
  const {
    ref,
    open,
    onOpenChange,
    anchorRef,
    
    label,
    children,
    items,
    defaultSelected,
    selected,
    onSelectedChange,
    role = 'menu',
    triggerAction,
    menuSize,
    
    // Floating element props
    keyboardInteractions,
    placement,
    offset,
    enablePreciseTracking,
    
    ...propsRest
  } = props;
  
  const menuId = React.useId();
  const menuRef = React.useRef<React.ComponentRef<typeof MenuSelectMulti>>(null);
  const previousActiveElementRef = React.useRef<HTMLElement>(null);
  
  const {
    isMounted,
    isOpen,
    setIsOpen,
    refs,
    getReferenceProps,
    getFloatingProps,
    floatingStyles,
    placement: floatingPlacement,
  } = useFloatingMenu({
    role,
    triggerAction,
    keyboardInteractions,
    placement,
    offset,
    enablePreciseTracking,
    open,
    onOpenChange,
  });
  
  // Allow passing a ref to control the state of the menu imperatively
  useMenuImperativeRef({ ref, floatingRef: refs.floating, isOpen, setIsOpen });
  
  // Controlled/uncontrolled state logic
  useMenuOpenControl({ setIsOpen, open });
  
  // Keyboard navigation logic
  const { toggleCauseRef, onAnchorKeyDown, onMenuKeyDown } = useMenuKeyboardNavigation({ setIsOpen, menuRef });
  
  const { handleToggle } = useMenuToggle({ menuRef, action: triggerAction, toggleCauseRef, previousActiveElementRef });
  
  const { internalSelected, handleInternalSelect } = useMenuSelect({
    previousActiveElementRef,
    setIsOpen,
    triggerAction,
    selected,
    defaultSelected,
    canCloseMenu: false,
  });
  
  const getRenderArgs = React.useCallback((base: BaseAnchorRenderArgs): AnchorRenderArgs => {
    return { ...base, selectedOptions: internalSelected };
  }, [internalSelected]);
  const { anchor } = useMenuAnchor({
    children,
    isOpen,
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
    popover: 'manual',
    style: floatingStyles,
    className: cx(cl['bk-menu-provider__list-box']),
  });
  
  const selectedFromInternalSelected = React.useMemo(() => {
    return new Set(internalSelected.keys()); // 'null' for controlled 'Menu'
  }, [internalSelected]);
  
  const handleSelect = React.useCallback((selectedKeys: Set<ItemKey>) => {
    onSelectedChange?.(selectedKeys);
    handleInternalSelect(selectedKeys);
  }, [onSelectedChange, handleInternalSelect]);
  
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
              onToggle: handleToggle,
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
    Group: MenuSelectMulti.Group,
    Footer: MenuSelectMulti.Footer,
  },
);
