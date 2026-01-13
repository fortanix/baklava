/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

// Utils
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeRefs } from '../../../util/reactUtil.ts';
import { useDebounce } from '../../../util/hooks/useDebounce.ts';
import {
  type UseFloatingElementOptions,
  UseFloatingElementResult,
  useFloatingElement,
} from '../../util/overlays/floating-ui/useFloatingElement.tsx';

// Components
import * as ListBox from '../../forms/controls/ListBox/ListBox.tsx';

// Styles
import cl from './MenuProvider.module.scss';


export type ItemDetails = ListBox.ItemDetails;
export type ItemKey = ListBox.ItemKey;
type ListBoxProps = ComponentProps<typeof ListBox.ListBox>;
type InternalItemDetails = Map<string, { label: string }>;

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
   * Alias for `triggerAction`. Deprecated, use `triggerAction` instead.
   * @deprecated
   */
  action?: undefined | UseFloatingElementOptions['triggerAction'],
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
};

export const useFloatingMenu = (options: useFloatingMenuOptions) => {
  const {
    role,
    triggerAction,
    action,
    keyboardInteractions,
    placement,
    offset,
    open,
    onOpenChange,
  } = options;

  return useFloatingElement({
    role,
    triggerAction: triggerAction ?? action ?? 'click',
    keyboardInteractions,
    placement: placement ?? 'bottom',
    offset: offset ?? 8,
    floatingUiFlipOptions: {
      fallbackAxisSideDirection: 'none',
      fallbackStrategy: 'initialPlacement',
    },
    floatingUiOptions: typeof open !== 'undefined'
        ? { open, ...(onOpenChange ? { onOpenChange } : {}) }
        : undefined,
  });
};

/**
 * MENU OPEN CONTROL - CONTROLLED OR UNCONTROLLED OPEN
 * ---------------------------------------------------------------------------------------------------------------------
 */ 
type UseMenuOpenControlOptions = {
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  open?: undefined | boolean,
};
export const useMenuOpenControl = (options: UseMenuOpenControlOptions) => {
  const {isOpen, setIsOpen, open } = options;
  const [shouldMountMenu] = useDebounce(isOpen, isOpen ? 0 : 1000);

  // NOTE: This is temporary. Keep internal state in sync with the controlled prop
  React.useEffect(() => {
    if (typeof open !== 'undefined') { setIsOpen(open); }
  }, [open, setIsOpen]);

  return { shouldMountMenu };
};

/**
 * MENU KEYBOARD NAVIGATION (ARROW-UP OR ARROW-DOWN)
 * ---------------------------------------------------------------------------------------------------------------------
 */
type UseMenuKeyboardNavigationOptions = {
  setIsOpen: (open: boolean) => void,
  listBoxRef: React.RefObject<React.ComponentRef<typeof ListBox.ListBox> | null>,
};
export const useMenuKeyboardNavigation = (props: UseMenuKeyboardNavigationOptions) => {
  const { setIsOpen, listBoxRef } = props;
  const toggleCauseRef = React.useRef<null | 'ArrowUp' | 'ArrowDown'>(null);

  const onAnchorKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

    toggleCauseRef.current = event.key;  // Store how the menu was opened for later use in `handleToggle`
    event.preventDefault(); // Prevent scrolling
    setIsOpen(true);

    // NOTE: need to wait until the list has actually opened
    // FIXME: need a more reliable way to do this (ref callback?)
    window.setTimeout(() => {
      const el = listBoxRef.current;
      if (!el) return;
      
      if (event.key === 'ArrowDown') {
        el._bkListBoxFocusFirst();
      } else if (event.key === 'ArrowUp') {
        el._bkListBoxFocusLast();
      }
    }, 100);
  }, [setIsOpen, listBoxRef.current]);

  const onMenuKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // On "enter", select the currently focused item and close the menu
    // Note: already handled through the `ListBox` element
    //if (event.key === 'Enter') { ... }

    // On "escape", close the menu
    // Note: already handled by floating-ui
    //if (event.key === 'Escape') { setIsOpen(false); }
  }, []);

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
  children?: React.ReactNode | ((args: RenderArgs) => React.ReactNode),
  isOpen: boolean,
  setIsOpen: (open: boolean) => void,
  listBoxId: string;
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
    listBoxId,
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
        'aria-controls': listBoxId,
        'aria-haspopup': 'listbox',
        'aria-expanded': isOpen,
        // biome-ignore lint/suspicious/noExplicitAny: `onKeyDown` should be a function here
        onKeyDown: mergeCallbacks([props.onKeyDown as any, onKeyDown]),
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
    listBoxId,
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
  setIsOpen: (open: boolean) => void,
  isOpen: boolean,
  floatingEl: null | HTMLElement,
};

type UseMenuImperativeRefOptions = {
  ref?: React.Ref<null | MenuProviderRef> | undefined,
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

/**
 * MENU LISTBOX FOCUS
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type UseMenuListBoxFocusOptions = {
  setIsOpen: (open: boolean) => void
};

export const useMenuListBoxFocus = (options: UseMenuListBoxFocusOptions) => {
  const { setIsOpen } = options;

  const listBoxFocusRef: React.RefCallback<HTMLElement> = React.useCallback((listBoxElement) => {
    if (!listBoxElement) return;

    const controller = new AbortController();

    listBoxElement.addEventListener(
      'focusout',
      (event) => {
        // Special case: in Firefox triggering a file select causes a `focusout` which we don't want closing the menu
        if (
          event.target instanceof HTMLInputElement
            && event.target.type === 'file'
            && event.relatedTarget === null
        ) {
          return;
        }

        const focusTarget = event.relatedTarget;

        if (!focusTarget || (focusTarget instanceof Node && !listBoxElement.contains(focusTarget))) {
          setIsOpen(false);
        }
      },
      { signal: controller.signal }
    );

    return () => controller.abort();
  }, [setIsOpen]);

  return { listBoxFocusRef };
};

/**
 * MENU SELECT HANDLER
 * ---------------------------------------------------------------------------------------------------------------------
 */
const buildSelectedItemDetailsMap = (
  selected?: undefined | Set<string>,
  formatItemLabel?: undefined | ((itemKey: string) => string | undefined),
): Map<string, { label: string }> => {
  return selected
    ? new Map([...selected].map(k => [k, { label: formatItemLabel?.(k) ?? String(k) }]))
    : new Map();
};

// Helper hook 'useLazyRef' lazily initializes a ref value without re-running the initializer
// on every render. Passing an expression directly to 'React.useRef()' (e.g. 'React.useRef(fn())')
// would unnecessarily invoke 'fn' on each render, even though the ref value itself is preserved.
// This helper ensures the initializer runs exactly once.
const useLazyRef = <T,>(initializer: () => T) => {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) { ref.current = initializer(); }

  return ref as React.RefObject<T>;
};

type UseMenuSelectHandlerOptions = {
  previousActiveElementRef: React.RefObject<HTMLElement | null>,
  setIsOpen: (open: boolean) => void;
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'];
  selected?: undefined | Set<string>,
  defaultSelected?: undefined | Set<string>,
  formatItemLabel?: undefined | ListBoxProps['formatItemLabel'],
  canCloseMenu?: undefined | boolean,
};
export const useMenuSelect = (options: UseMenuSelectHandlerOptions) => {
  const {
    previousActiveElementRef,
    setIsOpen,
    triggerAction = 'click',
    selected,
    defaultSelected,
    formatItemLabel,
    canCloseMenu = true,
  } = options;
  
  // If the 'selected' prop is provided, the component is treated as controlled.
  const isControlled = typeof selected !== 'undefined';
  // State 'internalSelected' stores the currently selected item keys.
  // When the menu provider is used in controlled mode, this state is kept
  // in sync with the `selected` prop.
  const [internalSelected, setInternalSelected] = React.useState<InternalItemDetails>(() => {
    return buildSelectedItemDetailsMap(selected ?? defaultSelected, formatItemLabel);
  });
  // Ref 'selectedItemDetailsRef' is required because option labels can be provided directly via
  // 'MenuProvider.Option' (e.g. '<MenuProvider.Option itemKey="x" label="Label" />').
  // Consumers may or may not provide 'formatItemLabel', and an explicit 'label' on the
  // option can override the value returned by 'formatItemLabel'. This ref stores the
  // resolved label so the correct value can be passed to the menu anchor.
  const selectedItemDetailsRef = useLazyRef<InternalItemDetails>(() => {
    return buildSelectedItemDetailsMap(selected ?? defaultSelected, formatItemLabel);
  });

  React.useEffect(() => {
    if (isControlled) {
      // In controlled mode, keep internal state in sync with the parent-controlled value
      const itemDetails = buildSelectedItemDetailsMap(selected, formatItemLabel);
      setInternalSelected(itemDetails);

      if (formatItemLabel) {
        selectedItemDetailsRef.current = itemDetails;
      }
    }
  }, [isControlled, selected, formatItemLabel, selectedItemDetailsRef]);

  const handleInternalSelect = React.useCallback((selectedItemDetails: InternalItemDetails) => {
    // NOTE: Important - the label from 'MenuProvider.Option' is captured here so it can
    // be forwarded to the menu anchor.
    selectedItemDetailsRef.current = selectedItemDetails;

    if (!isControlled) {
      // When not controlled by the parent, update the internal selection state directly
      setInternalSelected(selectedItemDetails);
    }

    if (!canCloseMenu) { return; }

    window.setTimeout(() => {
      const previous = previousActiveElementRef.current;

      if (previous) {
        previous.focus({ focusVisible: false });
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
    selectedItemDetailsRef,
    canCloseMenu,
  ]);

  return {
    internalSelected,
    selectedItemDetailsRef,
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
  listBoxRef: React.RefObject<React.ComponentRef<typeof ListBox.ListBox> | null>,
  previousActiveElementRef: React.RefObject<HTMLElement | null>,
  action?: undefined | UseFloatingElementOptions['triggerAction'],
  toggleCauseRef?: undefined | React.RefObject<'ArrowUp' | 'ArrowDown' | null>,
};
export const useMenuToggle = (options: UseMenuToggleOptions) => {
  const {
    listBoxRef,
    previousActiveElementRef,
    action,
    toggleCauseRef,
  } = options;

  const handleToggle = React.useCallback((event: React.ToggleEvent) => {
    const listBoxElement = listBoxRef.current;
    if (!listBoxElement) return;

    if (event.oldState === 'closed' && event.newState === 'open') {
      if (document.activeElement instanceof HTMLElement) {
        previousActiveElementRef.current = document.activeElement;
      }

      // For click actions, move focus to the list box upon toggling
      if (action !== 'click') return;

      if (toggleCauseRef?.current === 'ArrowDown') {
        listBoxElement._bkListBoxFocusFirst();
      } else if (toggleCauseRef?.current === 'ArrowUp') {
        listBoxElement._bkListBoxFocusLast();
      } else {
        listBoxElement.focus();
      }

      if (toggleCauseRef) {
        toggleCauseRef.current = null;
      }
    }

    if (event.oldState === 'open' && event.newState === 'closed') {
      const previousActiveElement = previousActiveElementRef.current;

      if (previousActiveElement && listBoxElement.matches(':focus-within')) {
        previousActiveElement.focus({ focusVisible: false });
      }
    }
  }, [action, listBoxRef, toggleCauseRef, previousActiveElementRef]);

  return { handleToggle };
}

/**
 * MENU PROVIDER
 * Provider for a menu overlay that is triggered by (and positioned relative to) some anchor element.
 * ---------------------------------------------------------------------------------------------------------------------
 */
type AnchorRenderArgs = BaseAnchorRenderArgs & {
  selectedOption: ListBox.ItemDetails | null,
};
export type MenuProviderProps = Omit<ListBoxProps, 'ref' | 'children' | 'label' | 'size'> & {
  // Imperative control (TEMP)
  /** A React ref to control the menu provider imperatively. */
  ref?: undefined | React.Ref<null | MenuProviderRef>,
  /** For controlled open state. */
  open?: undefined | boolean,
  /** When controlled, callback to set state. */
  onOpenChange?: undefined | ((isOpen: boolean) => void),
  /** (optional) Use an existing DOM node as the positioning anchor. */
  anchorRef?: undefined | React.RefObject<HTMLElement | null>,

  /** An accessible name for this menu provider. Required. */
  label: string;

  /**
  * The content to render, which should contain the anchor. This should be a render prop which takes props to
  * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
  */
  children?: undefined | ((args: AnchorRenderArgs) => React.ReactNode | React.ReactNode);

  /** The menu items. */
  items: React.ReactNode | ((args: { close: () => void }) => React.ReactNode);

  /** The accessible role of the menu. */
  role?: undefined | UseFloatingElementOptions['role'],
  
  /** The action that should trigger the menu to open. */
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'],

  /**
   * Alias for `triggerAction`. Deprecated, use `triggerAction` instead.
   * @deprecated
   */
  action?: undefined | UseFloatingElementOptions['triggerAction'],
  
  /** The (inline) size of the menu. */
  menuSize?: ListBoxProps['size'],
  
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
export const MenuProvider = Object.assign((props: MenuProviderProps) => {
  const {
    label,
    children,
    items,
    defaultSelected,
    selected,
    onSelect,
    role,
    triggerAction,
    action,
    menuSize,
    keyboardInteractions,
    placement,
    offset,
    formatItemLabel,

    ref,
    open,
    onOpenChange,
    anchorRef,

    ...propsRest
  } = props;

  const listBoxRef = React.useRef<React.ComponentRef<typeof ListBox.ListBox>>(null);
  const listBoxId = `listbox-${React.useId()}`;
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);
  const selectedSet = React.useMemo(
    () => (selected != null ? new Set([selected]) : undefined),
    [selected],
  );
  const defaultSelectedSet = React.useMemo(
    () => (defaultSelected != null ? new Set([defaultSelected]) : undefined),
    [defaultSelected],
  ); 
  const {
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
    action,
    keyboardInteractions,
    placement,
    offset,
    open,
    onOpenChange,
  });
  const { shouldMountMenu } = useMenuOpenControl({ isOpen, setIsOpen, open });
  const { toggleCauseRef, onAnchorKeyDown, onMenuKeyDown } = useMenuKeyboardNavigation({ setIsOpen, listBoxRef });
  const { handleToggle } = useMenuToggle({ listBoxRef, action, toggleCauseRef, previousActiveElementRef });
  const { listBoxFocusRef } = useMenuListBoxFocus({ setIsOpen });
  const { internalSelected, selectedItemDetailsRef, handleInternalSelect } = useMenuSelect({
    previousActiveElementRef,
    setIsOpen,
    triggerAction: triggerAction ?? action,
    formatItemLabel,
    selected: selectedSet,
    defaultSelected: defaultSelectedSet,
  })
  const getRenderArgs = React.useCallback((base: BaseAnchorRenderArgs): AnchorRenderArgs => {
    const itemKey = selectedItemDetailsRef.current.keys().next().value;
    const label = selectedItemDetailsRef.current.values().next().value?.label;

    return {
      ...base,
      selectedOption: itemKey ? { itemKey, label: label ?? itemKey } : null,
    };
  }, [selectedItemDetailsRef.current]);
  const { anchor } = useMenuAnchor({
    children,
    isOpen,
    setIsOpen,
    listBoxId,
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

  useMenuImperativeRef({ ref, isOpen, setIsOpen, floatingRef: refs.floating });

  const floatingProps = getFloatingProps({
    popover: 'manual',
    style: floatingStyles,
    ...propsRest,
    className: cx(cl['bk-menu-provider__list-box'], propsRest.className),
    onKeyDown: mergeCallbacks([propsRest.onKeyDown, onMenuKeyDown]),
  });

  const mergedListBoxRef = mergeRefs<React.ComponentRef<typeof ListBox.ListBox>>(
    listBoxRef,
    listBoxFocusRef,
    refs.setFloating,
    floatingProps.ref as React.Ref<React.ComponentRef<typeof ListBox.ListBox>>,
  );

  const selectedFromInternalSelected = React.useMemo(() => {
    return internalSelected.keys().next().value ?? null; // 'null' for controlled 'ListBox'
  }, [internalSelected]);

  const handleSelect = React.useCallback((_key: ListBox.ItemKey | null, itemDetails: ListBox.ItemDetails | null) => {
    const label = itemDetails?.label ?? null;
    const itemKey = itemDetails?.itemKey ?? null;
    onSelect?.(itemKey, itemKey === null ? null : { itemKey, label: (label ?? itemKey) });
    handleInternalSelect(itemKey ? new Map([[itemKey, { label: label ?? itemKey }]]) : new Map());
  }, [onSelect, handleInternalSelect]);

  return (
    <>
      {anchor}
      {shouldMountMenu && (
        <ListBox.ListBox
          {...floatingProps}
          {...propsRest}
          ref={mergedListBoxRef}
          size={menuSize}
          label={label}
          selected={selectedFromInternalSelected}
          defaultSelected={defaultSelected}
          onSelect={handleSelect}
          onToggle={handleToggle}
          data-placement={floatingPlacement}
        >
          {typeof items === 'function'
            ? items({ close: () => { setIsOpen(false); } })
            : items}
        </ListBox.ListBox>
      )}
    </>
  );
}, {
    Static: ListBox.Static,
    Option: ListBox.Option,
    Action: ListBox.Action,
    Header: ListBox.Header,
    FooterActions: ListBox.FooterActions,
  },
);

