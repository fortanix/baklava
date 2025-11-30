/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import {
  type Side,
  type Alignment,
  type Placement,
  autoUpdate,
  offset,
  shift,
  limitShift,
  flip,
  hide,
  arrow,
  type ElementProps,
  type UseRoleProps,
  type UseFloatingOptions,
  type FlipOptions,
  type ShiftOptions,
  type ReferenceType,
  type ExtendedRefs,
  type FloatingContext,
  useFloating,
  // Interactions
  useRole,
  useFocus,
  useClick,
  useDismiss,
  useDelayGroup,
  useHover,
  type UseInteractionsReturn,
  useInteractions,
  useTransitionStatus,
} from '@floating-ui/react';
import { usePopover } from '../popover/usePopover.ts';


export type { Placement };


type UsePopoverInteractionOptions = {
  /** The popover behavior for the floating element. */
  popoverBehavior: React.HTMLAttributes<unknown>['popover'],
};
/**
 * Floating UI interaction hook to sync the `isOpen` state with browser `popover` state.
 */
const usePopoverInteraction = (context: FloatingContext, options: UsePopoverInteractionOptions): ElementProps => {
  const anchorEl = context.elements.reference;
  
  // FIXME: add `event`/`reason` args here to `onOpenChange`?
  const activate = React.useCallback(() => { context.onOpenChange(true); }, [context.onOpenChange]);
  const deactivate = React.useCallback(() => { context.onOpenChange(false); }, [context.onOpenChange]);
  
  const popoverController = React.useMemo(() => ({
    source: anchorEl instanceof HTMLElement ? anchorEl : null,
    active: context.open,
    activate,
    deactivate,
  }), [anchorEl, context.open, activate, deactivate]);
  const { popoverProps } = usePopover(popoverController, {
    popoverBehavior: options.popoverBehavior,
  });
  
  /*
  // Must be memoized, since this is used as a memo dep in `useInteractions`
  const referenceProps = React.useMemo<React.HTMLProps<Element>>(() => ({
    //popoverTarget: popoverId,
    //style: {},
  }), []);
  */
  
  // Must be memoized, since this is used as a memo dep in `useInteractions`
  const floatingProps = React.useMemo<React.HTMLProps<HTMLElement>>(() => ({
    ref: popoverProps.ref,
    popover: options.popoverBehavior,
  }), [popoverProps.ref, options.popoverBehavior]);
  
  return {
    //reference: referenceProps,
    floating: floatingProps,
  };
};


type UseFocusInteractiveOptions = {
  /** Whether to enable this interaction. Useful for conditional usage of the hook. */
  enabled?: undefined | boolean,
};
/**
 * Floating UI interaction hooks for interactive focus trigger.
 */
const useFocusInteractive = (context: FloatingContext, options: UseFocusInteractiveOptions = {}): ElementProps => {
  const enabled = options.enabled ?? true;
  
  const anchorEl = context.elements.reference;
  const popoverEl = context.elements.floating;
  
  const handleReferenceFocus = React.useCallback((event: React.FocusEvent) => {
    if (!enabled) { return; }
    
    context.onOpenChange(true, event.nativeEvent, 'focus');
  }, [enabled, context.onOpenChange]);
  
  const handleReferenceBlur = React.useCallback((event: React.FocusEvent) => {
    if (!enabled) { return; }
    
    const anchorEl = event.currentTarget;
    
    const isInside = event.relatedTarget instanceof Node && (
      popoverEl && popoverEl.isConnected && popoverEl.contains(event.relatedTarget)
        || anchorEl.contains(event.relatedTarget)
    );
    
    if (!isInside) {
      context.onOpenChange(false, event.nativeEvent, 'focus-out');
    }
  }, [enabled, popoverEl, context.onOpenChange]);
  
  const handleFloatingBlur = React.useCallback((event: React.FocusEvent) => {
    if (!enabled) { return; }
    
    const popoverEl = event.currentTarget;
    
    const isInside = event.relatedTarget instanceof Node
      && (
        (anchorEl instanceof Node && anchorEl.contains(event.relatedTarget))
        || popoverEl.contains(event.relatedTarget)
      );
    
    if (!isInside) {
      // Give the component a little bit of time to perform its own internal focus management. For example:
      // in `DatePicker` (react-datepicker), navigating by keyboard (arrow keys) to a day from another month will
      // cause a re-render to switch to another month, during which a `focusout` happens.
      window.setTimeout(() => {
        if (!popoverEl.isConnected) { return; } // Make sure the popover element is still there after the timeout
        
        const isInside = document.activeElement instanceof Node
          && (
            (anchorEl instanceof Node && anchorEl.contains(document.activeElement))
            || popoverEl.contains(document.activeElement)
          );
        if (!isInside) {
          context.onOpenChange(false, event.nativeEvent, 'focus-out');
        }
      }, 0);
    }
  }, [enabled, anchorEl, context.onOpenChange]);
  
  // Handle click outside
  React.useEffect(() => {
    if (!enabled) { return; }
    
    const controller = new AbortController();
    
    document.addEventListener('click', event => {
      if (!anchorEl || !(anchorEl instanceof Node)) { return; }
      
      const isInside = event.target instanceof Node
        && (anchorEl.contains(event.target) || popoverEl?.contains(event.target));
      
      if (!isInside) {
        // Set a timeout, to give the component the chance to run some logic (e.g. focus guards).
        // FIXME: use React `flushSync()` here?
        window.setTimeout(() => {
          const isInside = document.activeElement instanceof Node
            && (
              anchorEl.contains(document.activeElement) || popoverEl?.contains(document.activeElement)
            );
          if (!isInside) {
            context.onOpenChange(false, event, 'outside-press');
          }
        }, 0);
      }
    }, { signal: controller.signal });
    
    return () => { controller.abort(); };
  }, [enabled, anchorEl, popoverEl, context.onOpenChange]);
  
  // Must be memoized, since this is used as a memo dep in `useInteractions`
  const referenceProps = React.useMemo<React.HTMLProps<Element>>(() => ({
    onFocus: handleReferenceFocus,
    onBlur: handleReferenceBlur,
  }), [handleReferenceFocus, handleReferenceBlur]);
  
  // Must be memoized, since this is used as a memo dep in `useInteractions`
  const floatingProps = React.useMemo<React.HTMLProps<HTMLElement>>(() => ({
    onBlur: handleFloatingBlur,
  }), [handleFloatingBlur]);
  
  return {
    reference: referenceProps,
    floating: floatingProps,
  };
};


export type UseFloatingElementOptions = {
  /** The popover type for the floating element. Default: `'manual'`. */
  popoverBehavior?: undefined | UsePopoverInteractionOptions['popoverBehavior'],
  
  /** The ARIA role for this element (e.g. `'tooltip'`, `'listbox'`, `'combobox'`). */
  role?: undefined | UseRoleProps['role'],
  
  /**
   * The kind of keyboard interactions to configure on the floating element. Default: `'default'`.
   * - 'none': No keyboard interactions set.
   * - 'default': Acts as a menu button [1] (e.g. "enter" key will activate the popover).
   *   [1] https://www.w3.org/WAI/ARIA/apg/patterns/menu-button
   * - 'form-control': Appropriate keyboard interactions for a form control (e.g. "enter" key should trigger submit).
   */
  keyboardInteractions?: undefined | 'none' | 'default' | 'form-control',
  
  /**
   * The action on the reference element that should cause the floating element to open. Default: `'click'`.
   * - `click`: Clicking on the reference element will toggle the floating element.
   * - `hover`: The floating element will be open when the user hovers on or focuses the reference element.
   * - `focus`: The floating element will be open when the reference element is focused.
   * - `focus-interactive`: The floating element will be open when the reference element is focused, or when the user
   *   focuses an element inside of the floating element. Clicking inside the floating element (thus losing focus) will
   *   also not close it, light dismiss will only occur when clicking outside of the floating/reference element.
   */
  triggerAction?: undefined | 'none' | 'click' | 'hover' | 'focus' | 'focus-interactive',
  
  /** Where to place the floating element, relative to the reference element. */
  placement?: undefined | Placement,
  
  /** The offset (in pixels) of the floating element relative to the reference element. */
  offset?: undefined | number,
  
  /* Enable more precise tracking of the anchor, at the cost of performance. Default: `false`. */
  enablePreciseTracking?: undefined | boolean,
  
  /** Boundary around the floating element that will be used for things like overflow detection. */
  boundary?: undefined | Element,
  
  /** Reference to an arrow element (like a tooltip arrow), if any. */
  arrowRef?: undefined | null | React.RefObject<Element>,
  
  /**
   * Whether this has a delay group.
   * @see https://floating-ui.com/docs/floatingdelaygroup
   */
  hasDelayGroup?: undefined | boolean,
  
  /** Additional options to pass to the internal `useFloating` hook. */
  floatingUiOptions?: undefined | UseFloatingOptions,
  /** Additional options to pass to the internal `flip` middleware. */
  floatingUiFlipOptions?: undefined | FlipOptions,
  /** Additional options to pass to the internal `shift` middleware. */
  floatingUiShiftOptions?: undefined | ShiftOptions,
  /** Additional interactions to pass to the internal `useFloating` hook. */
  floatingUiInteractions?: undefined | ((context: FloatingContext) => Array<undefined | ElementProps>),
};

export type UseFloatingElementResult = {
  context: FloatingContext,
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
  isMounted: boolean,
  refs: ExtendedRefs<ReferenceType>,
  placement: Placement,
  floatingStyles: React.CSSProperties,
  getReferenceProps: UseInteractionsReturn['getReferenceProps'],
  getFloatingProps: UseInteractionsReturn['getFloatingProps'],
  getItemProps: UseInteractionsReturn['getItemProps'],
};

/**
 * Configure an element to float on top of the content, and is anchored to some reference element. Internally uses
 * `useFloating` from `floating-ui`.
 */
export const useFloatingElement = <E extends HTMLElement>(
  options: UseFloatingElementOptions = {},
): UseFloatingElementResult => {
  const opts = {
    ...options,
    popoverBehavior: options.popoverBehavior ?? 'manual',
    role: options.role,
    triggerAction: options.triggerAction ?? 'click',
    placement: options.placement ?? 'top',
    offset: options.offset ?? 0,
    keyboardInteractions: options.keyboardInteractions ?? 'default',
    enablePreciseTracking: options.enablePreciseTracking ?? false,
    boundary: options.boundary ?? undefined,
    arrowRef: options.arrowRef ?? null,
    hasDelayGroup: options.hasDelayGroup ?? false,
    
    floatingUiOptions: options.floatingUiOptions ?? {},
    floatingUiFlipOptions: options.floatingUiFlipOptions ?? {},
    floatingUiShiftOptions: options.floatingUiShiftOptions ?? {},
    floatingUiInteractions: options.floatingUiInteractions ?? (() => []),
  } as const satisfies Required<UseFloatingElementOptions>;
  
  // Floating UI middleware. Note: the order matters here (each modifies the coordinates in sequence).
  const middleware: UseFloatingOptions['middleware'] = [
    // Offset the floating element from the reference element.
    offset(opts.offset),
    // Flip the side in case of overflow
    flip({
      fallbackAxisSideDirection: 'end',
      //fallbackStrategy: 'initialPlacement',
      crossAxis: false, // Useful with `shift()`, see: https://floating-ui.com/docs/flip
      ...(opts.boundary ? { boundary: opts.boundary } : {}),
      ...opts.floatingUiFlipOptions,
    }),
    // Shift the floating element on the cross-axis in case of overflow
    shift({
      limiter: limitShift({ offset: 10 }),
      ...(opts.boundary ? { boundary: opts.boundary } : {}),
      ...opts.floatingUiShiftOptions,
    }),
  ];
  
  if (opts.triggerAction === 'hover') {
    middleware.push(hide({
      strategy: 'escaped',
      ...(opts.boundary ? { boundary: opts.boundary } : {}),
    }));
  }
  if (opts.arrowRef) {
    middleware.push(arrow({ element: opts.arrowRef }));
  }
  
  // Track the open state of the popover
  const [isOpen, setIsOpen] = React.useState(false);
  
  const onOpenChange = React.useCallback<Required<UseFloatingOptions>['onOpenChange']>(
    (isOpen, event, _reason) => {
      // For form controls (e.g. listbox), 'Enter' key events on the reference element should be ignored, these should
      // instead trigger the default form submit behavior. This holds both when currently open or not open.
      const shouldIgnoreEnter = opts.keyboardInteractions === 'form-control';
      const isEnterKeyEvent = event instanceof KeyboardEvent && event.key === 'Enter';
      if (shouldIgnoreEnter && isEnterKeyEvent) {
        return;
      }
      
      setIsOpen(isOpen);
    },
    [opts.keyboardInteractions],
  );
  
  const { context, refs, placement, floatingStyles } = useFloating<E>({
    // Controlled state
    open: isOpen,
    onOpenChange,
    
    // Options
    placement: opts.placement,
    strategy: 'fixed', // Use `fixed` to contain within the viewport (as opposed to containing block with `absolute`)
    
    // Callback to update the positioning
    whileElementsMounted: (referenceEl, floatingEl, update) => {
      const cleanup = autoUpdate(referenceEl, floatingEl, update, {
        animationFrame: opts.enablePreciseTracking,
      });
      return cleanup;
    },
    
    ...opts.floatingUiOptions,
    middleware: [
      ...middleware,
      ...(opts.floatingUiOptions.middleware ?? []),
    ],
  });
  
  // Interactions
  // Note: floating-ui interactions may call React hooks, so make sure to apply the rules of React hooks here. For
  // conditional rendering, use the various `enabled` options.
  
  // Note: for `role="tooltip"`, no `aria-haspopup` is necessary on the anchor because it is not interactive:
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-haspopup
  const role = useRole(context, {
    ...opts.role ? { role: opts.role } : {},
  });
  
  const interactions: Array<ElementProps> = [
    role,
    usePopoverInteraction(context, { popoverBehavior: opts.popoverBehavior }),
  ];
  
  // Trigger action: click
  const clickInteractions = [
    useClick(context, {
      enabled: opts.triggerAction === 'click',
      toggle: true,
      keyboardHandlers: opts.keyboardInteractions === 'default',
    }),
    useDismiss(context, { enabled: opts.triggerAction === 'click' }),
  ];
  
  // Trigger action: focus
  const focusInteractions = [
    useFocus(context, {
      enabled: opts.triggerAction === 'focus',
      // Trigger even when a focus is caused that is not `:focus-visible`. For instance, clicking on a button.
      visibleOnly: false,
    }),
  ];
  
  // Trigger action: focus-interactive
  const focusInteractiveInteractions = [
    useFocusInteractive(context, { enabled: opts.triggerAction === 'focus-interactive' }),
  ];
  
  // Trigger action: hover
  const { delay: groupDelay } = useDelayGroup(context, { enabled: opts.triggerAction === 'hover' });
  const delay = opts.hasDelayGroup ? groupDelay : {
    open: 500/*ms*/, // Fallback time to open after if the cursor never "rests"
    close: 200/*ms*/, // Allows the user to move the cursor from anchor to floating element without closing
  };
  const hoverInteractions = [
    useFocus(context, { enabled: opts.triggerAction === 'hover' }),
    useHover(context, {
      enabled: opts.triggerAction === 'hover',
      restMs: 50/*ms*/, // User's cursor must be at rest before triggering
      delay,
    }),
  ];
  
  if (opts.triggerAction === 'click') { interactions.push(...clickInteractions); }
  if (opts.triggerAction === 'focus') { interactions.push(...focusInteractions); }
  if (opts.triggerAction === 'focus-interactive') { interactions.push(...focusInteractiveInteractions); }
  if (opts.triggerAction === 'hover') { interactions.push(...hoverInteractions); }
  
  // Note: the array that is passed to `useInteractions()` will internally be passed as `useMemo` deps. Take care
  // to memoize anything we pass in here.
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    ...interactions,
    ...opts.floatingUiInteractions(context),
    
    // Support React 19 style `ref` prop out of the box rather than requiring them to be separate
    // XXX this doesn't work because the `ref` prop doesn't get merged properly in `useInteraction`
    // {
    //   reference: { ref: el => { refs.setReference(el); } },
    //   floating: { ref: el => { refs.setFloating(el); } },
    // },
  ]);
  
  
  // Keep the tooltip mounted for a little while after close to allow exit animations to occur
  const { isMounted } = useTransitionStatus(context, { duration: { open: 0, close: 500 } });
  
  return {
    context,
    isOpen,
    setIsOpen,
    isMounted,
    refs,
    placement,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    getItemProps,
  };
};


// Derived from:
// https://github.com/floating-ui/floating-ui/blob/master/packages/react/src/components/FloatingArrow.tsx
type FloatingElementArrowOptions = {
  context: FloatingContext,
  // Forces a static offset over dynamic positioning under a certain condition.
  staticOffset?: string | number | null;
};
type FloatingElementArrowResult = null | {
  side: Side,
  arrowX: undefined | number | string,
  arrowY: undefined | number | string,
};
export const useFloatingElementArrow = (options: FloatingElementArrowOptions): FloatingElementArrowResult => {
  const {
    context: {
      placement,
      elements: { floating },
      middlewareData: { arrow },
    },
    staticOffset,
  } = options;
  
  if (!floating) { return null; }
  
  const [tooltopSide, _tooltipAlignment] = placement.split('-') as [Side, Alignment];
  // const isVerticalSide = side === 'top' || side === 'bottom';
  // 
  // const isRTL = platform.isRTL(floating);
  // const yOffsetProp = staticOffset && alignment === 'end' ? 'bottom' : 'top';
  // let xOffsetProp = staticOffset && alignment === 'end' ? 'right' : 'left';
  // if (staticOffset && isRTL) {
  //   xOffsetProp = alignment === 'end' ? 'left' : 'right';
  // }
  
  const invertSide = (side: Side) => {
    switch (side) {
      case 'top': return 'bottom';
      case 'bottom': return 'top';
      case 'left': return 'right';
      case 'right': return 'left';
      default: return side;
    }
  };
  
  return {
    side: invertSide(tooltopSide),
    arrowX: staticOffset || (typeof arrow?.x === 'number' ? `${arrow.x}px` : undefined),
    arrowY: staticOffset || (typeof arrow?.y === 'number' ? `${arrow.y}px` : undefined),
  };
};
