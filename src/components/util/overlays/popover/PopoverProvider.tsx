/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { useDelayedUnmount } from '../../../../util/hooks/useDelayedUnmount.ts';
import { type UsePopoverResult, usePopover } from './usePopover.ts';
import { usePopoverTracker } from '../TopLayerManager.tsx';


export type PopoverRef = {
  active: boolean,
  activate: () => void,
  deactivate: () => void,
};

export type PopoverParams<E extends HTMLElement> = UsePopoverResult<E> & {
  close: () => void,
};

export const useRef = React.useRef<PopoverRef>;

export type PopoverProviderProps<E extends HTMLElement> = {
  ref?: undefined | React.Ref<PopoverRef>,
  
  /** The trigger that activates the popover overlay. */
  children?: undefined | ((triggerProps: { active: boolean, activate: () => void }) => React.ReactNode),
  
  /** The popover to be shown in the popover overlay. */
  popover: (params: PopoverParams<E>) => React.ReactNode,
  
  /** Whether the popover is active. Use this if you want the popover to be a controlled component. */
  active?: undefined | boolean,
  
  /** If the popover is a controlled component, this callback will be called when the active state should change. */
  onActiveChange?: undefined | React.Dispatch<React.SetStateAction<boolean>>,
  
  /** If uncontrolled, specifies whether the popover should be active by default. Default: false. */
  activeDefault?: undefined | boolean,
  
  /** How long to keep the popover in the DOM for exit animation purposes. Default: 3 seconds. */
  unmountDelay?: undefined | number,
};
/**
 * Provider around a trigger (e.g. button) to display a popover overlay on trigger activation.
 */
export const PopoverProvider = Object.assign(
  <E extends HTMLElement>(props: PopoverProviderProps<E>) => {
    const {
      ref,
      children,
      popover,
      activeDefault = false,
      unmountDelay = 3000, // ms
    } = props;
    
    const [activeUncontrolled, setActiveUncontrolled] = React.useState(activeDefault);
    const active = typeof props.active !== 'undefined' ? props.active : activeUncontrolled;
    const setActive = typeof props.onActiveChange !== 'undefined' ? props.onActiveChange : setActiveUncontrolled;
    const [shouldMount, setActiveWithDelay] = useDelayedUnmount(active, setActive, unmountDelay);
    
    const popoverRef = React.useMemo<PopoverRef>(() => ({
      //source, // TODO: need a reference to the trigger element
      active: active,
      activate: () => { setActiveWithDelay(true); },
      deactivate: () => { setActiveWithDelay(false); },
    }), [active, setActiveWithDelay]);
    
    React.useImperativeHandle(ref, () => popoverRef, [popoverRef]);
    
    const popoverParams = Object.assign(usePopover<E>(popoverRef), {
      close: popoverRef.deactivate,
    });
    
    // Track this as part of our top layer elements tracker
    usePopoverTracker(active);
    
    return (
      <>
        {shouldMount && popover(popoverParams)}
        {typeof children === 'function' ? children(popoverRef) : children}
      </>
    );
  },
  {
    useRef,
  },
);
