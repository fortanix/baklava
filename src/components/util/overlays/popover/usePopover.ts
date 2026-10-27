/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import type { HtmlElementProps } from '../../../../util/reactUtil.ts';


export type OpenChangeEvent = {
  /** The new `open` state. */
  open: boolean,
  /**
   * Whether this state change should be considered forced or not. If forced, the consumer *must* respect this change
   * event, otherwise the DOM state and the React state may become out of sync, or the synchronization might not be
   * able to guarantee that there won't be a brief DOM change before we are able to re-apply the state.
   */
  forced: boolean,
};
export type OpenStateProps = {
  /** Whether the popover should currently be `open`. If `undefined`, the state is considered uncontrolled. */
  open?: undefined | boolean,
  /** If uncontrolled, what the default `open` state should be. Default: `false`. */
  defaultOpen?: undefined | boolean,
  /** Callback that is called when the `open` state changes. */
  onOpenChange?: undefined | ((event: OpenChangeEvent) => void),
};
export type PopoverController = OpenStateProps & {
  /** The source element (trigger/anchor) of the popover. */
  source?: undefined | null | HTMLElement,
};

/**
 * Programmatically update the `open` state of a popover element in the DOM.
 */
const updatePopoverElement = (params: {
  /** The `[popover]` element. */
  popoverEl: HTMLElement,
  /** The source element (e.g. a `<button popovertarget="foo">`) that triggered the popover state change. Optional. */
  sourceEl: null | HTMLElement,
  /** Whether the popover should be open or closed. */
  shouldBeOpen: boolean,
}) => {
  const { popoverEl, sourceEl, shouldBeOpen } = params;
  
  // Make sure we have something to sync with
  if (!popoverEl.isConnected) { return; }
  
  // Tell the browser the "source" of the `togglePopover`. This will (1) change the tab order so that the popover is
  // injected after the source while it's open, (2) set up an "implicit anchor" for CSS anchor positioning, and (3)
  // be added to the `ToggleEvent` so that we can link a popover toggle to its source from an event listener.
  // Requirements:
  // - Must be an `HTMLElement` (`<svg>` won't work, browser will throw an exception)
  // - Should be an interactive (i.e. focusable) element (won't cause an exception, but tab order will not work)
  const source = ((): undefined | HTMLElement => {
    // TODO: should we also check whether `sourceEl` is focusable? If it's not, maybe we can trigger a warning.
    if (sourceEl instanceof HTMLElement && sourceEl.isConnected) {
      return sourceEl;
    } else {
      return undefined;
    }
  })();
  
  /*
  Possible reasons `popoverEl.togglePopover` might throw an exception:
    - `popoverEl` is not a popover (i.e. not an `HTMLElement` with `popover` attribute set)
    - `popoverEl` is not connected
    - `source` is not a valid `HTMLElement` (e.g. it's an `SVGElement` instead)
  
  Note: use `togglePopover({ force: boolean })` over `showPopover`/`hidePopover`, since the former won't throw on
  repeated invocations.
  */
  
  const isPopoverOpen = popoverEl.matches(':popover-open');
  if (shouldBeOpen && !isPopoverOpen) { // Case: should be open but isn't
    try {
      popoverEl.togglePopover({ force: true, ...(typeof source === 'undefined' ? {} : { source }) });
    } catch (error: unknown) {
      console.error(`Unable to open popover`, error);
      
      // FIXME: what to do in case the sync failed? We might want to do a forced update on the controller, like below.
      // However, we should prevent ending up in an endless loop where controller tries to update and the DOM fails.
      //controller.onOpenChange({ open: isPopoverOpen, forced: true });
    }
  } else if (!shouldBeOpen && isPopoverOpen) { // Case: should not be open but is
    try {
      popoverEl.togglePopover({ force: false, ...(typeof source === 'undefined' ? {} : { source }) });
    } catch (error: unknown) {
      console.error(`Failed to close popover`, error);
      
      //controller.onOpenChange({ open: isPopoverOpen, forced: true }); // FIXME
    }
  } else {
    // State already matches (no need to do anything)
  }
};

export type UsePopoverOptions<E extends HTMLElement> = {
  /** The behavior that this `[popover]` element should have. Default: `"auto"`. */
  popoverBehavior?: undefined | React.HTMLAttributes<E>['popover'],
};
export type UsePopoverResult<E extends HTMLElement> = {
  /** Props that should be applied to the `[popover]` element. */
  popoverProps: HtmlElementProps<E>,
};
/**
 * A utility hook to create a popover element, and optionally control or track its `open` state from React.
 */
export const usePopover = <E extends HTMLElement = HTMLElement>(
  controller: PopoverController,
  options: undefined | UsePopoverOptions<E> = {},
): UsePopoverResult<E> => {
  const { popoverBehavior = 'auto' } = options;
  
  if (typeof controller.open !== 'undefined' && typeof controller.onOpenChange === 'undefined') {
    console.warn('Missing `onOpenChange` in controlled `usePopover()` usage');
  }
  
  const popoverRef = React.useRef<E>(null);
  const hasInitialized = React.useRef(false);
  
  // Should be memoized, since React will call the ref callback for every new function reference we pass to `ref`
  const popoverRefCallback = React.useCallback<React.RefCallback<E>>(ref => {
    popoverRef.current = ref; // Keep track of the popover element
    if (!ref) { return; }
    
    if (typeof controller.open !== 'undefined') { // Controlled case
      // Sync the DOM state with our controller.
      // Note: we use a ref callback for this rather than a `useEffect`. This helps prevent timing issues where `open`
      // is set to `true` in the controller, but the popover is not yet mounted (and thus the ref is still `null`). In
      // that case, a `useEffect` would be too early.
      updatePopoverElement({
        popoverEl: ref,
        sourceEl: controller.source ?? null,
        shouldBeOpen: controller.open,
      });
    } else if (!hasInitialized.current) { // Uncontrolled case
      updatePopoverElement({
        popoverEl: ref,
        sourceEl: controller.source ?? null,
        shouldBeOpen: controller.defaultOpen ?? false,
      });
      hasInitialized.current = true;
    }
  }, [controller.source, controller.open, controller.defaultOpen]);
  
  // Track toggle events (i.e. user events that change the popover state, e.g. light dismiss for `popover="auto"`)
  const handlePopoverToggle = React.useCallback<React.ToggleEventHandler<E>>(event => {
    // Make sure this event targets our popover and not some other element.
    // Note: toggle events should not bubble, but it seems this event handler is called for nested popovers/dialogs?
    // Possibly related to this React bug: https://github.com/facebook/react/issues/34038
    if (!popoverRef.current || event.target !== popoverRef.current) { return; }
    
    const isOpen = event.newState === 'open';
    
    // Note: call `onOpenChange` only if (1) it is uncontrolled (it is just a notification in this case), or (2) if
    // the state is controlled and it is different. The latter prevents an unnecessary render cycle.
    const isUncontrolled = typeof controller.open === 'undefined';
    if (isUncontrolled || isOpen !== controller.open) {
      // Notify the controller
      controller.onOpenChange?.({
        open: isOpen,
        // Note: there is also a `beforetoggle` event, which does allow cancellation. However, it only allows
        // cancellation when opening, not when closing, so it is not super useful for us at the moment.
        forced: true, // The DOM change already happened
      });
    }
  }, [controller.open, controller.onOpenChange]);
  
  return {
    popoverProps: {
      ref: popoverRefCallback,
      popover: popoverBehavior,
      onToggle: handlePopoverToggle,
    },
  };
};
