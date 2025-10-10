/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeProps } from '../../../../util/reactUtil.ts';

import { type PopoverController, usePopover } from '../popover/usePopover.ts';

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
export const useFloatingElementNative = (options: UseFloatingElementOptions = {}): UseFloatingElementResult => {
  const opts = {
    ...options,
    role: options.role,
    triggerAction: options.triggerAction ?? 'click',
    placement: options.placement ?? 'top',
    offset: options.offset ?? 0,
    keyboardInteractions: options.keyboardInteractions ?? 'default',
    enablePreciseTracking: options.enablePreciseTracking ?? false, // Irrelevant with anchor pos
    boundary: options.boundary ?? undefined, // Not supported yet
    arrowRef: options.arrowRef ?? null, // Not supported yet
    hasDelayGroup: options.hasDelayGroup ?? false, // Not supported yet
    
    floatingUiOptions: options.floatingUiOptions ?? {},
    floatingUiFlipOptions: options.floatingUiFlipOptions ?? {},
    floatingUiShiftOptions: options.floatingUiShiftOptions ?? {},
    floatingUiInteractions: options.floatingUiInteractions ?? (() => []),
  } as const satisfies Required<UseFloatingElementOptions>;
  
  
  //
  // State
  //
  
  const [isOpen, setIsOpen] = React.useState(false);
  const isMounted = true; // TEMP: always keep it mounted (maybe use `<Activity>`?)
  
  
  //
  // Refs
  //
  
  const referenceRef = React.useRef<null | HTMLElement>(null); // The reference element (i.e. the anchor)
  const floatingRef = React.useRef<null | HTMLElement>(null); // The floating element (i.e. the popover)
  
  const setReference = React.useCallback((el: null | HTMLElement) => {
    referenceRef.current = el;
  }, []);
  const setFloating = React.useCallback((el: null | HTMLElement) => {
    floatingRef.current = el;
  }, []);
  
  const refs = React.useMemo<UseFloatingElementResult['refs']>(() => {
    return {
      reference: referenceRef,
      domReference: referenceRef, // Will always be the same as `reference` in our case (no virtual element support)
      setReference,
      floating: floatingRef,
      setFloating,
      setPositionReference: () => {}, // Unsupported
    };
  }, [setReference, setFloating]);
  
  
  //
  // Popover management
  //
  const popoverControlled = React.useMemo<PopoverController>(() => ({
    source: referenceRef,
    active: isOpen,
    activate: () => { setIsOpen(true); },
    deactivate: () => { setIsOpen(false); },
  }), [isOpen]);
  const { popoverProps } = usePopover(popoverControlled, {
    // FIXME: make this customizable?
    popoverBehavior: opts.triggerAction === 'click' ? 'auto' : 'manual',
  });
  
  
  //
  // Props
  //
  
  const getReferenceProps = React.useCallback((userProps?: undefined | React.HTMLProps<Element>) => {
    const triggerProps = ((): Record<string, unknown> => {
      switch (opts.triggerAction) {
        case 'click': return {
          onClick: () => {
            setIsOpen(isOpen => !isOpen);
          },
        };
        case 'hover': return {
          onMouseOver: () => {
            setIsOpen(true);
          },
          onMouseOut: () => {
            setIsOpen(false);
          },
        };
        case 'focus': return {
          // FIXME: needs a focus wrapper?
          onFocus: () => {
            console.log('focus');
            setIsOpen(true);
          },
          onBlur: () => {
            console.log('blur');
            setIsOpen(false);
          },
        };
        default: return {};
      }
    })();
    
    return {
      ...mergeProps(
        userProps,
        triggerProps,
        {
          ref: setReference,
        },
      ),
    };
  }, [setReference, opts.triggerAction]);
  
  // Transform floating-ui `Placement` to CSS `position-area` value
  const positionArea = React.useMemo<string>(() => {
    switch (opts.placement) {
      case 'top': return 'block-start span-all';
      case 'top-start': return 'block-start start';
      case 'top-end': return 'block-start end';
      case 'right': return 'inline-end span-all';
      case 'right-start': return 'inline-end start';
      case 'right-end': return 'inline-end end';
      case 'bottom': return 'block-end span-all';
      case 'bottom-start': return 'block-end start';
      case 'bottom-end': return 'block-end end';
      case 'left': return 'inline-start span-all';
      case 'left-start': return 'inline-start start';
      case 'left-end': return 'inline-start end';
      default: return 'block-end span-all';
    }
  }, [opts.placement]);
  const getFloatingProps = React.useCallback(
    (userProps?: undefined | React.HTMLProps<Element>): Record<string, unknown> => {
      return {
        ...mergeProps(
          userProps,
          popoverProps,
          {
            ref: setFloating,
            style: {
              position: 'fixed',
              positionAnchor: 'auto',
              positionArea,
              positionTryFallbacks: 'flip-block',
              margin: opts.offset,
              ...userProps,
            },
          },
        ),
      };
    },
    [popoverProps, setFloating, positionArea],
  );
  
  const getItemProps = React.useCallback((userProps?: undefined | React.HTMLProps<Element>) => {
    return { ...userProps };
  }, []);
  
  // Sync popover state
  // React.useEffect(() => {
  //   const floatingEl = floatingRef.current;
  //   console.log('sync', isOpen, floatingEl);
  //   if (!floatingEl || !floatingEl.isConnected) { return; }
  //   
  //   console.log('toggle', isOpen, referenceRef.current ?? undefined);
  //   floatingEl.togglePopover({ source: referenceRef.current ?? undefined, force: isOpen });
  // }, [isOpen]);
  
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
