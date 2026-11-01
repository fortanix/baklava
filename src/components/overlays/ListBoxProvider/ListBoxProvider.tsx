/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeRefs, mergeProps, usePrevious } from '../../../util/reactUtil.ts';
import { useControllableStateFromProps } from '../../../util/hooks/useControllableState.ts';

// Components
import { type ItemKey, type SelectedState, ListBox } from '../../forms/controls/ListBox/ListBox.tsx';
import {
  type OpenStateProps,
  type OpenChangeEvent,
  type UseFloatingMenuOptions,
  useFloatingMenu,
  type BaseAnchorRenderArgs,
  useMenuAnchor,
} from '../../util/overlays/menu/menuUtil.tsx';

// Styles
import cl from './ListBoxProvider.module.scss';


export type { ItemKey, SelectedState };

export type ListBoxProviderRef = {
  open: boolean,
  requestOpenChange: (event: OpenChangeEvent) => void,
  selected: SelectedState,
  requestSelectedChange: (selected: SelectedState) => void,
  // FIXME: include these?
  //anchorEl: null | HTMLElement,
  //floatingEl: null | HTMLElement,
};

export type AnchorRenderArgs = BaseAnchorRenderArgs & {
  selectedOption: SelectedState,
};
export type ListBoxProviderProps =
  Omit<React.ComponentProps<typeof ListBox>, 'ref' | 'children' | 'label' | 'size'>
  & OpenStateProps
  & {
    /** A React ref to control the menu provider imperatively. */
    ref?: undefined | React.Ref<null | ListBoxProviderRef>,
    
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
    menuSize?: React.ComponentProps<typeof ListBox>['size'],
    
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
  };
/**
 * Wrapper around a trigger that provides an anchored popover listbox with single selection.
 */
export const ListBoxProvider = Object.assign(
  (props: ListBoxProviderProps) => {
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
      
      ...propsRest
    } = props;
    
    const menuId = React.useId();
    const menuRef = React.useRef<React.ComponentRef<typeof ListBox>>(null);
    
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
    } = useControllableStateFromProps<SelectedState>(
      {
        state: selected,
        defaultState: defaultSelected,
        onStateChange: onSelectedChange,
      },
      {
        debugName: 'ListBoxProvider',
        propName: 'selected',
        stateFromEvent: state => state,
        defaultStateFallback: null,
      },
    );
    
    // Close when the user selects an option
    // FIXME: this might be ambiguous? We're not 100% sure here if this came through a user request or sth programmatic
    const prevSelectedState = usePrevious(selectedState);
    React.useEffect(() => {
      if ((typeof prevSelectedState === 'undefined' || selectedState !== prevSelectedState) && openState === true) {
        // Have a small timeout so the user gets visual feedback for their selection (e.g. CSS animation)
        window.setTimeout(() => {
          requestOpenChange({ open: false });
        }, 150);
      }
    }, [prevSelectedState, selectedState, openState, requestOpenChange]);
    
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
      className: cx(cl['bk-list-box-provider__popover']),
    });
    const popover = isMounted && (
      <ListBox
        {...mergeProps(
          floatingProps,
          propsRest,
          { ref: mergeRefs<React.ComponentRef<typeof ListBox>>(menuRef, refs.setFloating) },
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
      </ListBox>
    );
    
    // Render anchor
    const getRenderArgs = React.useCallback((base: BaseAnchorRenderArgs): AnchorRenderArgs => ({
      ...base,
      selectedOption: selectedState,
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
    Option: ListBox.Option,
    Static: ListBox.Static,
    Segment: ListBox.Segment,
    SegmentVirtual: ListBox.SegmentVirtual,
    Group: ListBox.Group,
    Footer: ListBox.Footer,
  },
);
