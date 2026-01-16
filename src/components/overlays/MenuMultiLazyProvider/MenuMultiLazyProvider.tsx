/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

// Utils
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeRefs } from '../../../util/reactUtil.ts';
import { type UseFloatingElementOptions } from '../../util/overlays/floating-ui/useFloatingElement.tsx';

// Components
import * as ListBoxMultiLazy from '../../forms/controls/ListBoxMultiLazy/ListBoxMultiLazy.tsx';
import {
  BaseAnchorRenderArgs,
  MenuProviderRef,
  useFloatingMenu,
  useMenuAnchor,
  useMenuImperativeRef,
  useMenuKeyboardNavigation,
  useMenuListBoxFocus,
  useMenuOpenControl,
  useMenuSelect,
  useMenuToggle,
} from '../MenuMultiProvider/MenuMultiProvider.tsx';

// Styles
import { MenuProviderClassNames as cl } from '../MenuProvider/MenuProvider.tsx';


export type ItemDetails = ListBoxMultiLazy.ItemDetails;
export type ItemKey = ListBoxMultiLazy.ItemKey;
export type VirtualItemKeys = ListBoxMultiLazy.VirtualItemKeys;
type ListBoxMultiProps = ComponentProps<typeof ListBoxMultiLazy.ListBoxMultiLazy>;

/**
 * MENU PROVIDER
 * Provider for a menu overlay that is triggered by (and positioned relative to) some anchor element.
 * ---------------------------------------------------------------------------------------------------------------------
 */
type AnchorRenderArgs = BaseAnchorRenderArgs & {
  selectedOptions: Map<ListBoxMultiLazy.ItemKey, ListBoxMultiLazy.ItemDetails>,
};
export type MenuMultiLazyProviderProps = Omit<ListBoxMultiProps, 'ref' | 'children' | 'label' | 'size'> & {
  // Imperative control (TEMP)
  /** A React ref to control the menu provider imperatively. */
  ref?: undefined | React.Ref<null | MenuProviderRef>,
  /** For controlled open state. */
  open?: undefined | boolean,
  /** When controlled, callback to set state. */
  onOpenChange?: undefined | ((isOpen: boolean) => void),
  /** (optional) Use an existing DOM node as the positioning anchor. */
  anchorRef?: undefined | React.RefObject<HTMLElement | null>,

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
  role?: undefined | UseFloatingElementOptions['role'],
  
  /** The action that should trigger the menu to open. */
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'],

  /**
   * Alias for `triggerAction`. Deprecated, use `triggerAction` instead.
   * @deprecated
   */
  action?: undefined | UseFloatingElementOptions['triggerAction'],
  
  /** The (inline) size of the menu. */
  menuSize?: ListBoxMultiProps['size'],
  
  /**
   * The kind of keyboard interactions to include:
   * - 'none': No keyboard interactions set.
   * - 'form-control': Appropriate keyboard interactions for a form control (e.g. Enter should trigger submit).
   * - 'default': Acts as a menu button [1] (e.g. Enter will activate the popover).
   *   [1] https://www.w3.org/WAI/ARIA/apg/patterns/menu-button
   */
  keyboardInteractions?: undefined | UseFloatingElementOptions['keyboardInteractions'],
  
  /** Override the default placement */
  placement?: undefined | UseFloatingElementOptions['placement'],
  
  /** Offset size for the menu relative to the anchor. */
  offset?: undefined | UseFloatingElementOptions['offset'],
  
  /** Enable more precise tracking of the anchor, at the cost of performance. Default: `false`. */
  enablePreciseTracking?: undefined | UseFloatingElementOptions['enablePreciseTracking'],
};
export const MenuMultiLazyProvider = (props: MenuMultiLazyProviderProps) => {
  const {
    label,
    children,
    items,
    defaultSelected,
    selected,
    onSelect,
    role,
    triggerAction,
    action,
    menuSize,
    keyboardInteractions,
    placement,
    offset,
    renderItemLabel,

    ref,
    open,
    onOpenChange,
    anchorRef,

    ...propsRest
  } = props;

  const listBoxRef = React.useRef<React.ComponentRef<typeof ListBoxMultiLazy.ListBoxMultiLazy>>(null);
  const listBoxId = React.useId();
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);
   
  const {
    isMounted,
    isOpen,
    setIsOpen,
    refs,
    getReferenceProps,
    getFloatingProps,
    floatingStyles,
    placement: floatingPlacement,
  } = useFloatingMenu({
    role,
    triggerAction,
    action,
    keyboardInteractions,
    placement,
    offset,
    open,
    onOpenChange,
  });
  useMenuOpenControl({ setIsOpen, open });
  const { toggleCauseRef, onAnchorKeyDown, onMenuKeyDown } = useMenuKeyboardNavigation({ setIsOpen, listBoxRef });
  const { handleToggle } = useMenuToggle({ listBoxRef, action, toggleCauseRef, previousActiveElementRef });
  const { listBoxFocusRef } = useMenuListBoxFocus({ setIsOpen });
  const { internalSelected, selectedItemDetailsRef, handleInternalSelect } = useMenuSelect({
    previousActiveElementRef,
    setIsOpen,
    triggerAction: triggerAction ?? action,
    formatItemLabel: renderItemLabel,
    selected,
    defaultSelected,
    canCloseMenu: false,
  })
  const getRenderArgs = React.useCallback((base: BaseAnchorRenderArgs): AnchorRenderArgs => {
    return { ...base, selectedOptions: selectedItemDetailsRef.current };
  }, [selectedItemDetailsRef.current]);
  const { anchor } = useMenuAnchor({
    children,
    isOpen,
    setIsOpen,
    listBoxId,
    getReferenceProps,
    refs,
    onKeyDown: onAnchorKeyDown,
    getRenderArgs,
  });

  // Use external element as the reference, if provided
  React.useLayoutEffect(() => {
    if (anchorRef?.current) {
      refs.setReference(anchorRef.current);
    }
  }, [anchorRef, refs]);

  useMenuImperativeRef({ ref, isOpen, setIsOpen, floatingRef: refs.floating });

  const floatingProps = getFloatingProps({
    popover: 'manual',
    style: floatingStyles,
    ...propsRest,
    className: cx(cl['bk-menu-provider__list-box'], propsRest.className),
    onKeyDown: mergeCallbacks([propsRest.onKeyDown, onMenuKeyDown]),
  });

  const mergedListBoxRef = mergeRefs<React.ComponentRef<typeof ListBoxMultiLazy.ListBoxMultiLazy>>(
    listBoxRef,
    listBoxFocusRef,
    refs.setFloating,
    floatingProps.ref as React.Ref<React.ComponentRef<typeof ListBoxMultiLazy.ListBoxMultiLazy>>,
  );

  const selectedFromInternalSelected = React.useMemo(() => {
    return new Set(internalSelected.keys());
  }, [internalSelected]);

  const handleSelect = React.useCallback((
    _selectedKeys: Set<ListBoxMultiLazy.ItemKey>,
    itemDetails: Map<ListBoxMultiLazy.ItemKey, ListBoxMultiLazy.ItemDetails>,
  ) => {
    const itemKeys = new Set(itemDetails.keys());
    onSelect?.(itemKeys, itemDetails);
    handleInternalSelect(itemDetails);
  }, [onSelect, handleInternalSelect]);

  return (
    <>
      {anchor}
      {isMounted && (
        <ListBoxMultiLazy.ListBoxMultiLazy
          {...floatingProps}
          {...propsRest}
          ref={mergedListBoxRef}
          size={menuSize}
          label={label}
          selected={selectedFromInternalSelected}
          defaultSelected={defaultSelected}
          renderItemLabel={renderItemLabel}
          onSelect={handleSelect}
          onToggle={handleToggle}
          data-placement={floatingPlacement}
        />
      )}
    </>
  );
};

