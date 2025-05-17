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
  floatingUiOptions?: undefined | UseFloatingOptions,
  floatingUiFlipOptions?: undefined | FlipOptions,
  floatingUiInteractions?: undefined | ((context: FloatingContext) => Array<undefined | ElementProps>),
  role?: undefined | UseRoleProps['role'],
  action?: undefined | 'hover' | 'focus' | 'click',
  placement?: undefined | Placement,
  offset?: undefined | number,
  /**
   * The kind of keyboard interactions to include:
   * - 'none': No keyboard interactions set.
   * - 'form-control': Appropriate keyboard interactions for a form control (e.g. Enter should trigger submit).
   * - 'default': Acts as a menu button [1] (e.g. Enter will activate the popover).
   *   [1] https://www.w3.org/WAI/ARIA/apg/patterns/menu-button
   */
  keyboardInteractions?: undefined | 'none' | 'form-control' | 'default',
  enablePreciseTracking?: undefined | boolean, // Enable more precise tracking of the anchor, at the cost of performance
  boundary?: undefined | Element,
  arrowRef?: undefined | React.RefObject<Element>, // Reference to the arrow element, if any
  hasDelayGroup?: undefined | boolean,
};
/**
 * Wrapper around `useFloating` from `floating-ui`.
 */
export const useFloatingElement = (options: UseFloatingElementOptions = {}) => {
  const optionsWithDefaults = {
    ...options,
    floatingUiOptions: options.floatingUiOptions ?? {},
    floatingUiFlipOptions: options.floatingUiFlipOptions ?? {},
    floatingUiInteractions: options.floatingUiInteractions ?? (() => []),
    role: options.role,
    action: options.action ?? 'click',
    placement: options.placement ?? 'top',
    offset: options.offset ?? 0,
    keyboardInteractions: options.keyboardInteractions ?? 'default',
    enablePreciseTracking: options.enablePreciseTracking ?? false,
    arrowRef: options.arrowRef ?? null,
    hasDelayGroup: options.hasDelayGroup ?? false,
  };
  
  // Memoize `action` to make sure it doesn't change, to prevent conditional use of hooks
  // biome-ignore lint/correctness/useExhaustiveDependencies: explicitly not using `action` as a dependency
  const action = React.useMemo(() => optionsWithDefaults.action, []);
  
  const middleware: UseFloatingOptions['middleware'] = [
    offset(optionsWithDefaults.offset),
    flip({
      fallbackAxisSideDirection: 'end',
      //fallbackStrategy: 'initialPlacement',
      crossAxis: false, // Useful with `shift()`, see: https://floating-ui.com/docs/flip
      ...(optionsWithDefaults.boundary ? { boundary: optionsWithDefaults.boundary } : {}),
      ...optionsWithDefaults.floatingUiFlipOptions,
    }),
    shift({
      limiter: limitShift({ offset: 10 }),
      ...(optionsWithDefaults.boundary ? { boundary: optionsWithDefaults.boundary } : {}),
    }),
  ];
  
  if (action === 'hover') {
    middleware.push(hide({
      strategy: 'escaped',
      ...(optionsWithDefaults.boundary ? { boundary: optionsWithDefaults.boundary } : {}),
    }));
  }
  if (optionsWithDefaults.arrowRef) {
    middleware.push(arrow({ element: optionsWithDefaults.arrowRef }));
  }
  
  const [isOpen, setIsOpen] = React.useState(false);
  
  const onOpenChange = React.useCallback<Required<UseFloatingOptions>['onOpenChange']>(
    (isOpen, event, _reason) => {
      const shouldIgnoreEnter = optionsWithDefaults.keyboardInteractions === 'form-control';
      if (shouldIgnoreEnter && event instanceof KeyboardEvent && event.key === 'Enter') {
        return;
      }
      setIsOpen(isOpen);
    },
    [optionsWithDefaults.keyboardInteractions],
  );
  
  const { context, refs, placement, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange,
    placement: optionsWithDefaults.placement,
    strategy: 'fixed', // Use `fixed` to contain within the viewport (as opposed to containing block with `absolute`)
    whileElementsMounted(referenceEl, floatingEl, update) {
      const cleanup = autoUpdate(referenceEl, floatingEl, update, {
        animationFrame: optionsWithDefaults.enablePreciseTracking,
      });
      return cleanup;
    },
    ...optionsWithDefaults.floatingUiOptions,
    middleware: [
      ...middleware,
      ...(optionsWithDefaults.floatingUiOptions.middleware ?? []),
    ],
  });
  
  // Note: for `role="tooltip", no `aria-haspop` is necessary on the anchor because it is not interactive:
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-haspopup
  const role = useRole(context, {
    ...optionsWithDefaults.role ? { role: optionsWithDefaults.role } : {},
  });
  
  const interactions: Array<ElementProps> = [
    role,
    usePopover(context),
  ];
  
  if (action === 'click') {
    interactions.push(useClick(context, {
      toggle: true,
      keyboardHandlers: optionsWithDefaults.keyboardInteractions === 'default',
    }));
    interactions.push(useDismiss(context));
  }
  if (action === 'focus' || action === 'hover') {
    interactions.push(useFocus(context));
  }
  if (action === 'hover') {
    const { delay: groupDelay } = useDelayGroup(context);
    const delay = optionsWithDefaults.hasDelayGroup ? groupDelay : {
      open: 500/*ms*/, // Fallback time to open after if the cursor never "rests"
      close: 200/*ms*/, // Allows the user to move the cursor from anchor to floating element without closing
    };
    interactions.push(useHover(context, {
      restMs: 20/*ms*/, // User's cursor must be at rest before opening
      delay,
    }));
  }
  
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    ...interactions,
    ...optionsWithDefaults.floatingUiInteractions(context),
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
  
  const [tooltopSide, tooltipAlignment] = placement.split('-') as [Side, Alignment];
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
