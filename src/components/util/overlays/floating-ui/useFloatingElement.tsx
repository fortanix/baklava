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
  type FloatingContext,
  useFloating,
  // Interactions
  useRole,
  useFocus,
  useClick,
  useDismiss,
  useDelayGroup,
  useHover,
  useInteractions,
  useTransitionStatus,
} from '@floating-ui/react';


export type { Placement };

// Sync the `isOpen` state with browser `popover` state
const usePopover = (context: FloatingContext): ElementProps => {
  return {
    floating: {
      ref: floatingElement => {
        if (!floatingElement) { return; }
        
        const isPopoverShown = floatingElement.matches(':popover-open');
        if (context.open && !isPopoverShown) {
          floatingElement.showPopover();
        } else if (!context.open && isPopoverShown) {
          floatingElement.hidePopover();
        }
      },
    },
  };
};

export type UseFloatingElementOptions = {
  /* The ARIA role for this element (e.g. `'tooltip'`). */
  role?: undefined | UseRoleProps['role'],
  
  /**
   * The kind of keyboard interactions to configure on the floating element. Default: `'default'`.
   * - 'none': No keyboard interactions set.
   * - 'form-control': Appropriate keyboard interactions for a form control (e.g. Enter key should trigger submit).
   * - 'default': Acts as a menu button [1] (e.g. Enter key will activate the popover).
   *   [1] https://www.w3.org/WAI/ARIA/apg/patterns/menu-button
   */
  keyboardInteractions?: undefined | 'none' | 'form-control' | 'default',
  
  /** The action on the reference element that should cause the floating element to open. */
  triggerAction?: undefined | 'hover' | 'focus' | 'click',
  
  /** Where to place the floating element, relative to the reference element. */
  placement?: undefined | Placement,
  
  /** The offset (in pixels) of the floating element relative to the reference element. */
  offset?: undefined | number,
  
  /* Enable more precise tracking of the anchor, at the cost of performance. Default: `false`. */
  enablePreciseTracking?: undefined | boolean,
  
  /** Boundary around the floating element that will be used for things like overflow detection. */
  boundary?: undefined | Element,
  
  /* Reference to an arrow element (like a tooltip arrow), if any. */
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
/**
 * Configure an element to float on top of the content, and is anchored to some reference element. Internally uses
 * `useFloating` from `floating-ui`.
 */
export const useFloatingElement = <E extends HTMLElement>(options: UseFloatingElementOptions = {}) => {
  const opts = {
    ...options,
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
  
  // Note: for `role="tooltip"`, no `aria-haspopup` is necessary on the anchor because it is not interactive:
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-haspopup
  const role = useRole(context, {
    ...opts.role ? { role: opts.role } : {},
  });
  
  
  // Interactions
  
  const interactions: Array<ElementProps> = [
    role,
    usePopover(context),
  ];
  
  const clickInteractions = [
    useClick(context, {
      enabled: opts.triggerAction === 'click',
      toggle: true,
      keyboardHandlers: opts.keyboardInteractions === 'default',
    }),
    useDismiss(context, { enabled: opts.triggerAction === 'click' }),
  ];
  
  const focusInteractions = [
    useFocus(context, { enabled: opts.triggerAction === 'focus' }),
  ];
  
  const { delay: groupDelay } = useDelayGroup(context, { enabled: opts.triggerAction === 'hover' });
  const delay = opts.hasDelayGroup ? groupDelay : {
    open: 200/*ms*/, // Fallback time to open after if the cursor never "rests"
    close: 200/*ms*/, // Allows the user to move the cursor from anchor to floating element without closing
  };
  const hoverInteractions = [
    useFocus(context, { enabled: opts.triggerAction === 'hover' }),
    useHover(context, {
      enabled: opts.triggerAction === 'hover',
      restMs: 20/*ms*/, // User's cursor must be at rest before triggering
      delay,
    }),
  ];
  
  if (opts.triggerAction === 'click') { interactions.concat(clickInteractions); }
  if (opts.triggerAction === 'focus') { interactions.concat(focusInteractions); }
  if (opts.triggerAction === 'hover') { interactions.concat(hoverInteractions); }
  
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    ...interactions,
    ...opts.floatingUiInteractions(context),
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
