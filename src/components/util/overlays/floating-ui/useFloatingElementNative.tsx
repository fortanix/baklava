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
  
  type ReferenceType,
} from '@floating-ui/react';

import type { UseFloatingElementOptions, UseFloatingElementResult } from './useFloatingElement.tsx';

export type { Placement, UseFloatingElementOptions };

/**
 * An alternative implementation of `useFloatingElement` that uses native browser CSS anchor positioning rather
 * than floating-ui.
 */
export const useFloatingElementNative = <E extends HTMLElement>(
  options: UseFloatingElementOptions = {},
): UseFloatingElementResult => {
  const opts = {
    ...options,
    role: options.role,
    triggerAction: options.triggerAction ?? 'click',
    placement: options.placement ?? 'top',
    offset: options.offset ?? 0,
    keyboardInteractions: options.keyboardInteractions ?? 'default',
    enablePreciseTracking: options.enablePreciseTracking ?? false, // Irrelevant
    boundary: options.boundary ?? undefined, // Not supported yet
    arrowRef: options.arrowRef ?? null, // Not supported yet
    hasDelayGroup: options.hasDelayGroup ?? false, // Not supported yet
    
    floatingUiOptions: options.floatingUiOptions ?? {},
    floatingUiFlipOptions: options.floatingUiFlipOptions ?? {},
    floatingUiShiftOptions: options.floatingUiShiftOptions ?? {},
    floatingUiInteractions: options.floatingUiInteractions ?? (() => []),
  } as const satisfies Required<UseFloatingElementOptions>;
  
  const [isOpen, setIsOpen] = React.useState(false);
  const isMounted = true; // TEMP
  
  const referenceRef = React.useRef<null | HTMLElement>(null);
  const floatingRef = React.useRef<null | HTMLElement>(null);
  
  const setReference = React.useCallback((el: null | HTMLElement) => {
    referenceRef.current = el;
  }, []);
  const setFloating = React.useCallback((el: null | HTMLElement) => {
    floatingRef.current = el;
  }, []);
  
  const refs = React.useMemo<UseFloatingElementResult['refs']>(() => {
    return {
      reference: referenceRef,
      domReference: referenceRef,
      floating: floatingRef,
      setReference,
      setFloating,
      setPositionReference: () => {}, // Unsupported
    };
  }, [setReference, setFloating]);
  
  const getReferenceProps = React.useCallback((userProps?: undefined | React.HTMLProps<Element>) => {
    return {
      ...userProps,
      onClick: (event: React.MouseEvent) => {
        setIsOpen(isOpen => !isOpen);
      },
    };
  }, []);
  
  const getFloatingProps = React.useCallback((userProps?: undefined | React.HTMLProps<Element>) => {
    return {
      ...userProps,
      style: {
        position: 'fixed',
        positionAnchor: 'auto',
        positionArea: 'bottom span-right',
        positionTryFallbacks: 'flip-block',
        ...userProps,
      },
    };
  }, []);
  
  const getItemProps = React.useCallback((userProps?: undefined | React.HTMLProps<Element>) => {
    return { ...userProps };
  }, []);
  
  // Sync popover state
  React.useEffect(() => {
    const floatingEl = floatingRef.current;
    console.log('sync', isOpen, floatingEl);
    if (!floatingEl || !floatingEl.isConnected) { return; }
    
    console.log('toggle', isOpen, referenceRef.current ?? undefined);
    floatingEl.togglePopover({ source: referenceRef.current ?? undefined, force: isOpen });
  }, [isOpen]);
  
  return {
    context: {},
    isOpen,
    setIsOpen,
    isMounted,
    refs,
    placement: opts.placement,
    floatingStyles: {},
    getReferenceProps,
    getFloatingProps,
    getItemProps,
  };
};
