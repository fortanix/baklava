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
  arrow,
  type ElementProps,
  type UseFloatingOptions,
  type FlipOptions,
  type FloatingContext,
  useFloating,
  useRole,
  useFocus,
  useClick,
  useDismiss,
  useDelayGroup,
  useHover,
  useInteractions,
  useTransitionStatus,
  hide,
} from '@floating-ui/react';


export { type Placement };

export type UsePopoverOptions = {
  floatingUiOptions?: UseFloatingOptions,
  floatingUiFlipOptions?: FlipOptions,
  floatingUiInteractions?: (context: FloatingContext) => Array<undefined | ElementProps>,
  action?: undefined | 'hover' | 'click',
  placement?: undefined | Placement,
  offset?: undefined | number,
  enablePreciseTracking?: boolean, // Enable more precise tracking of the anchor, at the cost of performance
  boundary?: undefined | Element,
  arrowRef?: React.RefObject<Element>, // Reference to the arrow element, if any
  hasDelayGroup?: undefined | boolean,
};
export const usePopover = (options: UsePopoverOptions = {}) => {
  const optionsWithDefaults = {
    ...options,
    floatingUiOptions: options.floatingUiOptions ?? {},
    floatingUiFlipOptions: options.floatingUiFlipOptions ?? {},
    floatingUiInteractions: options.floatingUiInteractions ?? (() => []),
    action: options.action ?? 'click',
    placement: options.placement ?? 'top',
    offset: options.offset ?? 0,
    enablePreciseTracking: options.enablePreciseTracking ?? false,
    arrowRef: options.arrowRef ?? null,
    hasDelayGroup: options.hasDelayGroup ?? false,
  };
  
  // Memoize `action` to make sure it doesn't change, to prevent conditional use of hooks
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
  
  const { context, refs, placement, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
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
  const role = useRole(context, { role: 'tooltip' });
  
  const interactions: Array<ElementProps> = [
    role,
  ];
  
  if (action === 'click') {
    interactions.push(useClick(context, { toggle: true }));
    interactions.push(useDismiss(context));
  } else if (action === 'hover') {
    interactions.push(useFocus(context));
    const { delay: groupDelay } = useDelayGroup(context);
    const delay = optionsWithDefaults.hasDelayGroup ? groupDelay : {
      open: 500/*ms*/, // Fallback time to open after if the cursor never "rests"
      close: 200/*ms*/, // Allows the user to move the cursor from anchor to tooltip without closing
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
  
  // Sync the `isOpen` state with browser `popover` state
  React.useEffect(() => {
    const floatingElement = refs.floating.current;
    if (!floatingElement) { return; }
    
    const isPopoverShown = floatingElement.matches(':popover-open');
    if (isOpen && !isPopoverShown) {
      floatingElement.showPopover();
    } else if (!isOpen && isPopoverShown) {
      floatingElement.hidePopover();
    }
  }, [isOpen, refs.floating]);
  
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
type PopoverArrowOptions = {
  context: FloatingContext,
  // Forces a static offset over dynamic positioning under a certain condition.
  staticOffset?: string | number | null;
};
type PopoverArrowResult = null | {
  side: Side,
  arrowX: undefined | number | string,
  arrowY: undefined | number | string,
};
export const usePopoverArrow = (options: PopoverArrowOptions): PopoverArrowResult => {
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
