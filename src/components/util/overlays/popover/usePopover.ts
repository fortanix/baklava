/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


export type PopoverController = {
  /** Whether the popover should be active. */
  active: boolean,
  /** Notify that the popover has been opened. Change must be respected (otherwise no longer in sync). */
  activate: () => void,
  /** Notify that the popover has been closed. Change must be respected (otherwise no longer in sync). */
  deactivate: () => void,
};

export type UsePopoverOptions = {
  popoverBehavior?: undefined | React.HTMLAttributes<unknown>['popover'], // Default: 'auto'
};

export type PopoverProps<E extends HTMLElement> = {
  close: () => void,
  popoverProps: React.DetailedHTMLProps<React.HTMLAttributes<E>, E>,
};

/*
 * A utility hook to control the state of a popover element (e.g. `<div popover>`).
 */
export const usePopover = <E extends HTMLElement>(
  controller: PopoverController,
  options: undefined | UsePopoverOptions = {},
): PopoverProps<E> => {
  const { popoverBehavior = 'manual' } = options ?? {};
  
  const popoverRef = React.useRef<E>(null);
  
  const requestPopoverClose = React.useCallback(() => {
    const popover = popoverRef.current;
    if (!popover) { console.warn(`Unable to close popover: reference does not exist.`); return; }
    
    try {
      popover.hidePopover();
    } catch (error: unknown) {
      console.error(`Failed to close popover`, error);
    }
  }, []);
  
  // Sync active state with popover DOM state
  const sync = () => {
    const popover = popoverRef.current;
    if (!popover) { return; } // Nothing to sync with
    
    const isPopoverOpen = popover.matches(':popover-open');
    if (controller.active && !isPopoverOpen) { // Should be active but isn't
      // Note: `showPopover()` can throw in some rare circumstances
      try {
        popover.showPopover();
      } catch (error: unknown) {
        console.error(`Unable to open modal popover`, error);
        controller.deactivate();
      }
    } else if (!controller.active && isPopoverOpen) { // Should not be active but is
      requestPopoverClose();
    }
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: Lists dependencies used in `sync`
  React.useEffect(sync, [controller.active, controller.deactivate, requestPopoverClose]);
  
  const handlePopoverToggle = React.useCallback((event: React.ToggleEvent<E>) => {
    // Note: it seems this event handler is also called for popovers/dialogs nested inside. Even though the event
    // should not bubble?
    if (event.target !== popoverRef.current) { return; }
    
    // Sync with the controller
    if (event.newState === 'open') {
      controller.activate();
    } else {
      controller.deactivate();
    }
  }, [controller.activate, controller.deactivate]);
  
  // Added for outside click detection
  React.useEffect(() => {
    if (!controller.active) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLElement)) {
        return;
      }

      const popover = popoverRef.current;
      
      // Prevent popover from closing if click was inside the popover
      if (!popover || popover.contains(target)) {
        return;
      }

      // Prevent popover from closing if click was inside portal
      const isInPortal = target.closest('[data-portal]');
      if (isInPortal) {
        return;
      }

      // Otherwise, clicked outside both → close the popover
      controller.deactivate();
    };
    
    // Listen for outside clicks
    document.addEventListener('mousedown', handleClickOutside, true);
    
    // Clean up when component unmounts or controller becomes inactive
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [controller.active, controller.deactivate]);


  
  // Sync when the ref changes. This helps prevent time issues where `active` is set to `true`, but the popover is not
  // yet mounted (and thus the ref is `null`). In that case our sync `useEffect` will be too early.
  const popoverRefCallback: React.RefCallback<E> = (ref) => {
    popoverRef.current = ref;
    sync();
  };
  
  return {
    close: requestPopoverClose,
    popoverProps: {
      ref: popoverRefCallback,
      
      popover: popoverBehavior,
      onToggle: handlePopoverToggle,
    },
  };
};
