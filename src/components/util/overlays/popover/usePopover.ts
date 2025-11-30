/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';


export type PopoverController = {
  /** The source element (trigger/anchor) of the popover. */
  source?: undefined | null | HTMLElement,
  
  /** Whether the popover should be active. */
  active: boolean,
  /** Notify that the popover has been opened. Change must be respected (otherwise no longer in sync). */
  activate: () => void,
  /** Notify that the popover has been closed. Change must be respected (otherwise no longer in sync). */
  deactivate: () => void,
};

// Sync the given controller state with the popover DOM state
const syncPopoverWithController = (params: {
  popoverEl: null | HTMLElement,
  sourceEl: null | HTMLElement,
  controllerActive: boolean,
}) => {
  const { popoverEl, sourceEl, controllerActive } = params;
  
  // Make sure we have something to sync with
  if (!popoverEl || !popoverEl.isConnected) { return; }
  
  // The "source" of the `togglePopover` [...]
  // Requirements:
  // - Must be an `HTMLElement` (`<svg>` won't work, browser will throw an exception)
  // - Must be an interactive element (`<div>` won't work)
  // Note: it is important that the `source` points to the anchor element, so that the browser will add the
  // popover in the focus tab order after the `source` element. It is also necessary that it is a focusable
  // element, otherwise the tab order will break (popover won't be in the tab order at all).
  const source = ((): undefined | HTMLElement => {
    if (sourceEl instanceof HTMLElement && sourceEl.isConnected) {
      return sourceEl;
    } else {
      return undefined;
    }
  })();
  
  /*
  Possible reasons `popoverEl.togglePopover` may throw an exception:
    - `source` is not a valid `HTMLElement`
    - `popoverEl` is not a popover (i.e. not an `HTMLElement` with `popover` attribute set)
  */
  
  const isPopoverActive = popoverEl.matches(':popover-open');
  if (controllerActive && !isPopoverActive) { // Case: should be active but isn't
    try {
      popoverEl.togglePopover({ force: true, source });
    } catch (error: unknown) {
      console.error(`Unable to open popover`, error);
      //controller.deactivate(); // Attempt to feed this state back to the controller to prevent de-sync
    }
  } else if (!controllerActive && isPopoverActive) { // Case: should not be active but is
    try {
      popoverEl.togglePopover({ force: false, source });
    } catch (error: unknown) {
      console.error(`Failed to close popover`, error);
      //controller.activate(); // Attempt to feed this state back to the controller to prevent de-sync
    }
  }
};

export type UsePopoverOptions = {
  popoverBehavior?: undefined | React.HTMLAttributes<unknown>['popover'], // Default: 'auto'
};

export type UsePopoverResult<E extends HTMLElement> = {
  popoverProps: React.DetailedHTMLProps<React.HTMLAttributes<E>, E>,
};

/**
 * A utility hook to control the state of a popover element.
 */
export const usePopover = <E extends HTMLElement = HTMLElement>(
  controller: PopoverController,
  options: undefined | UsePopoverOptions = {},
): UsePopoverResult<E> => {
  const { popoverBehavior = 'auto' } = options;
  
  const popoverRef = React.useRef<E>(null);
  
  // Should be memoized, since React will call the ref callback for every new function reference we pass to `ref`
  const popoverRefCallback: React.RefCallback<E> = React.useCallback(ref => {
    popoverRef.current = ref;
    
    // Sync when the ref changes. This helps prevent timing issues where `active` is set to `true`, but the popover is
    // not yet mounted (and thus the ref is still `null`). In that case, our sync `useEffect` will be too early.
    syncPopoverWithController({
      popoverEl: ref,
      sourceEl: controller.source ?? null,
      controllerActive: controller.active,
    });
  }, [controller.source, controller.active, /*controller.deactivate*/]);
  
  // Track toggle events (i.e. user events that change the popover state, like light dismiss for `popover="auto"`)
  const handlePopoverToggle = React.useCallback((event: React.ToggleEvent<E>) => {
    // Make sure this event targets our popover and not some other element.
    // Note: toggle events should not bubble, but it seems this event handler is called for nested popovers/dialogs?
    // Possibly related to this React bug: https://github.com/facebook/react/issues/34038
    if (!popoverRef.current || event.target !== popoverRef.current) { return; }
    
    // Sync with the controller
    if (event.newState === 'open') {
      controller.activate();
    } else {
      controller.deactivate();
    }
  }, [controller.activate, controller.deactivate]);
  
  return {
    popoverProps: {
      ref: popoverRefCallback,
      popover: popoverBehavior,
      onToggle: handlePopoverToggle,
    },
  };
};
