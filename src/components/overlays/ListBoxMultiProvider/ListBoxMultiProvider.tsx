/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeRefs, mergeProps } from '../../../util/reactUtil.ts';
import { useControllableStateFromProps } from '../../../util/hooks/useControllableState.ts';

// Components
import {
  type ItemKey,
  type SelectedState,
  type SelectedChangeEvent,
  type SelectedStateProps,
  ListBoxMulti,
} from '../../forms/controls/ListBoxMulti/ListBoxMulti.tsx';
import {
  type FocusChangeEvent,
  type OpenStateProps,
  type OpenChangeEvent,
  type UseFloatingMenuOptions,
  useFloatingMenu,
  type BaseAnchorRenderArgs,
  useMenuAnchor,
} from '../../util/overlays/menu/menuUtil.tsx';

// Styles
import cl from './ListBoxMultiProvider.module.scss';


export type { ItemKey, SelectedState, SelectedStateProps };

export type ListBoxMultiProviderRef = {
  open: boolean,
  requestOpenChange: (event: OpenChangeEvent) => void,
  selected: SelectedState,
  requestSelectedChange: (event: SelectedChangeEvent) => void,
  // FIXME: include these?
  //anchorEl: null | HTMLElement,
  //floatingEl: null | HTMLElement,
};

export type AnchorRenderArgs = BaseAnchorRenderArgs & {
  selectedOptions: SelectedState,
};
export type ListBoxMultiProviderProps =
  Omit<React.ComponentProps<typeof ListBoxMulti>, 'ref' | 'children' | 'label' | 'size'>
  & OpenStateProps
  & {
    /** A React ref to control the menu provider imperatively. */
    ref?: undefined | React.Ref<null | ListBoxMultiProviderRef>,
    
    /** Use an existing DOM node as the positioning anchor. Optional. */
    anchorRef?: undefined | React.RefObject<null | HTMLElement>,
    
    /** An accessible name for this menu provider. Required. */
    label: string,
    
    /**
    * The content to render, which should contain the anchor. This should be a render prop which takes props to
    * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
    */
    children?: undefined | ((args: AnchorRenderArgs) => React.ReactNode) | React.ReactNode,
    
    /** The menu items. */
    items: React.ReactNode | ((args: { close: () => void }) => React.ReactNode),
    
    /** The accessible role of the menu. */
    role?: undefined | UseFloatingMenuOptions['role'],
    
    /** The action that should trigger the menu to open. */
    triggerAction?: undefined | UseFloatingMenuOptions['triggerAction'],
    
    /** The (inline) size of the menu. */
    menuSize?: React.ComponentProps<typeof ListBoxMulti>['size'],
    
    /**
     * The kind of keyboard interactions to include:
     * - 'none': No keyboard interactions set.
     * - 'form-control': Appropriate keyboard interactions for a form control (e.g. Enter should trigger submit).
     * - 'default': Acts as a menu button [1] (e.g. Enter will activate the popover).
     *   [1] https://www.w3.org/WAI/ARIA/apg/patterns/menu-button
     */
    keyboardInteractions?: undefined | UseFloatingMenuOptions['keyboardInteractions'],
    
    /** Override the default placement */
    placement?: undefined | UseFloatingMenuOptions['placement'],
    
    /** Offset size for the menu relative to the anchor. */
    offset?: undefined | UseFloatingMenuOptions['offset'],
    
    /** The popover behavior for the menu popover. Default: `"manual"`. */
    popoverBehavior?: undefined | UseFloatingMenuOptions['popoverBehavior'],
    
    /** Enable more precise tracking of the anchor, at the cost of performance. Default: `false`. */
    enablePreciseTracking?: undefined | UseFloatingMenuOptions['enablePreciseTracking'],
    
    /** Event callback that will be called when focus leaves both the anchor and popover. */
    onContainerFocusChange?: undefined | ((event: FocusChangeEvent) => void),
  };
/**
 * Wrapper around a trigger that provides an anchored popover listbox with multiple selection.
 */
export const ListBoxMultiProvider = Object.assign(
  (props: ListBoxMultiProviderProps) => {
    const {
      defaultSelected,
      selected,
      onSelectedChange,
      open,
      defaultOpen,
      onOpenChange,
      
      ref,
      anchorRef,
      label,
      children,
      items,
      menuSize,
      
      // Floating element props
      role = 'listbox',
      triggerAction,
      keyboardInteractions,
      placement,
      offset,
      popoverBehavior,
      enablePreciseTracking,
      
      // Container props
      onContainerFocusChange,
      
      ...propsRest
    } = props;
    
    const menuId = React.useId();
    const menuRef = React.useRef<React.ComponentRef<typeof ListBoxMulti>>(null);
    
    const trackOpenChange = React.useCallback((event: OpenChangeEvent) => {
      // Timeout to wait for the menu to render (and `menuRef` to be populated)
      window.setTimeout(() => {
        if (!event.open) { return; }
        
        // If the menu opened due to a `list-navigation` event, auto-focus the relevant item
        if (event.reason === 'list-navigation-first') {
          menuRef.current?._bkFocusFirst();
        } else if (event.reason === 'list-navigation-last') {
          menuRef.current?._bkFocusLast();
        }
      }, 0);
    }, []);
    
    const {
      isMounted,
      isOpen: openState,
      requestOpenChange,
      refs,
      getReferenceProps,
      getFloatingProps,
      floatingStyles,
      placement: floatingPlacement,
    } = useFloatingMenu({
      role,
      popoverBehavior,
      triggerAction,
      keyboardInteractions,
      placement,
      offset,
      enablePreciseTracking,
      open,
      onOpenChange: mergeCallbacks([onOpenChange, trackOpenChange]),
      onFocusChange: onContainerFocusChange,
    });
    // Use external element as the reference, if provided
    React.useLayoutEffect(() => {
      if (anchorRef?.current) {
        refs.setReference(anchorRef.current);
      }
    }, [anchorRef, refs]);
    
    // Track `selected` state
    const {
      state: selectedState,
      requestStateChange: requestSelectedChange,
    } = useControllableStateFromProps<SelectedState, SelectedChangeEvent>(
      {
        state: selected,
        defaultState: defaultSelected,
        onStateChange: onSelectedChange,
      },
      {
        debugName: 'ListBoxMultiProvider',
        propName: 'selected',
        stateFromEvent: event => event.selected,
        defaultStateFallback: new Set(),
      },
    );
    
    // Allow passing a ref to control the state of the menu imperatively
    React.useImperativeHandle(ref, () => ({
      open: openState,
      requestOpenChange,
      selected: selectedState,
      requestSelectedChange,
      // FIXME: also expose the element references?
      //get anchorEl() { return anchorRef.current; },
      //get floatingEl() { return floatingRef.current; },
    }), [openState, requestOpenChange, selectedState, requestSelectedChange]);
    
    
    // Render popover
    const floatingProps = getFloatingProps({
      style: floatingStyles,
      className: cx(cl['bk-list-box-multi-provider__popover']),
    });
    const popover = isMounted && (
      <ListBoxMulti
        {...mergeProps(
          floatingProps,
          propsRest,
          { ref: mergeRefs<React.ComponentRef<typeof ListBoxMulti>>(menuRef, refs.setFloating) },
        )}
        size={menuSize}
        label={label}
        selected={selectedState}
        //defaultSelected={defaultSelected} // Do not pass: `selectedState` is always controlled
        onSelectedChange={requestSelectedChange}
        data-placement={floatingPlacement}
      >
        {typeof items === 'function'
          ? items({ close: () => { requestOpenChange({ open: false }); } })
          : items
        }
      </ListBoxMulti>
    );
    
    // Render anchor
    const getRenderArgs = React.useCallback((base: BaseAnchorRenderArgs): AnchorRenderArgs => ({
      ...base,
      selectedOptions: selectedState,
    }), [selectedState]);
    const { anchor } = useMenuAnchor({
      children,
      isOpen: openState,
      requestOpenChange,
      menuId,
      getReferenceProps,
      refs,
      getRenderArgs,
    });
    
    return (
      <>
        {anchor}
        {popover}
      </>
    );
  },
  {
    Option: ListBoxMulti.Option,
    Static: ListBoxMulti.Static,
    Segment: ListBoxMulti.Segment,
    SegmentVirtual: ListBoxMulti.SegmentVirtual,
    Group: ListBoxMulti.Group,
    Footer: ListBoxMulti.Footer,
  },
);
