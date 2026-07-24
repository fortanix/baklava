/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

// Utils
import { classNames as cx } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeProps, mergeRefs } from '../../../util/reactUtil.ts';
import {
  type UseFloatingElementOptions,
} from '../../util/overlays/floating-ui/useFloatingElement.tsx';

// Components
import { type ItemKey, type SelectedSingleState, MenuSelect } from '../Menu/Menu.tsx';
import {
  BaseAnchorRenderArgs,
  selectionStateFromItemKey,
  MenuProviderRef,
  useFloatingMenu,
  useMenuAnchor,
  useMenuImperativeRef,
  useMenuKeyboardNavigation,
  useMenuOpenControl,
  useMenuSelect,
  useMenuToggle,
} from '../MenuMultiProvider/MenuMultiProvider.tsx';

// Styles
import cl from './MenuProvider.module.scss';


export { cl as MenuProviderClassNames };
export type { ItemKey };

type MenuSelectProps = React.ComponentProps<typeof MenuSelect>;

/**
 * MENU PROVIDER
 * Provider for a menu overlay that is triggered by (and positioned relative to) some anchor element.
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type AnchorRenderArgs = BaseAnchorRenderArgs & {
  selectedOption: SelectedSingleState,
};
export type MenuProviderProps = Omit<MenuSelectProps, 'ref' | 'children' | 'label' | 'size'> & {
  /** A React ref to control the menu provider imperatively. */
  ref?: undefined | React.Ref<null | MenuProviderRef>,
  /** For controlled open state. */
  open?: undefined | boolean,
  /** When controlled, callback to set state. */
  onOpenChange?: undefined | ((isOpen: boolean) => void),
  /** (optional) Use an existing DOM node as the positioning anchor. */
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
  role?: undefined | UseFloatingElementOptions['role'],
  
  /** The action that should trigger the menu to open. */
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'],
  
  /** The (inline) size of the menu. */
  menuSize?: MenuSelectProps['size'],
  
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
export const MenuProvider = Object.assign((props: MenuProviderProps) => {
  const {
    label,
    children,
    items,
    defaultSelected,
    selected,
    onSelectedChange,
    role = 'menu',
    triggerAction,
    menuSize,
    keyboardInteractions,
    placement,
    offset,
    enablePreciseTracking,

    ref,
    open,
    onOpenChange,
    anchorRef,

    ...propsRest
  } = props;

  const menuRef = React.useRef<React.ComponentRef<typeof MenuSelect>>(null);
  const menuId = React.useId();
  const previousActiveElementRef = React.useRef<null | HTMLElement>(null);
  const selectedSet = React.useMemo(() => selectionStateFromItemKey(selected), [selected]);
  const defaultSelectedSet = React.useMemo(() => selectionStateFromItemKey(defaultSelected), [defaultSelected]); 
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
    keyboardInteractions,
    placement,
    offset,
    enablePreciseTracking,
    open,
    onOpenChange,
  });
  useMenuOpenControl({ setIsOpen, open });
  const { toggleCauseRef, onAnchorKeyDown, onMenuKeyDown } = useMenuKeyboardNavigation({ setIsOpen, menuRef });
  const { handleToggle } = useMenuToggle({ menuRef, toggleCauseRef, previousActiveElementRef });
  const { internalSelected, handleInternalSelect } = useMenuSelect({
    previousActiveElementRef,
    setIsOpen,
    triggerAction: triggerAction,
    selected: selectedSet,
    defaultSelected: defaultSelectedSet,
  })
  const getRenderArgs = React.useCallback((base: BaseAnchorRenderArgs): AnchorRenderArgs => {
    const itemKey = internalSelected.keys().next().value;

    return {
      ...base,
      selectedOption: itemKey ?? null,
    };
  }, [internalSelected]);
  const { anchor } = useMenuAnchor({
    children,
    isOpen,
    setIsOpen,
    menuId,
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
    className: cx(cl['bk-menu-provider__list-box']),
  });

  const mergedProps = mergeProps(
    floatingProps,
    propsRest,
    {
      onKeyDown: mergeCallbacks([propsRest.onKeyDown, onMenuKeyDown]),
    },
  );

  const mergedListBoxRef = mergeRefs<React.ComponentRef<typeof MenuSelect>>(
    menuRef,
    refs.setFloating,
    floatingProps.ref as React.Ref<React.ComponentRef<typeof MenuSelect>>,
  );

  const selectedFromInternalSelected = React.useMemo(() => {
    return internalSelected.keys().next().value ?? null; // 'null' for controlled 'ListBox'
  }, [internalSelected]);

  const handleSelect = React.useCallback((itemKey: SelectedSingleState) => {
    onSelectedChange?.(itemKey);
    handleInternalSelect(itemKey === null ? new Set() : new Set([itemKey]));
  }, [onSelectedChange, handleInternalSelect]);

  return (
    <>
      {anchor}
      {isMounted && (
        <MenuSelect
          {...mergedProps}
          ref={mergedListBoxRef}
          size={menuSize}
          label={label}
          selected={selectedFromInternalSelected}
          defaultSelected={defaultSelected}
          onSelectedChange={handleSelect}
          onToggle={handleToggle}
          data-placement={floatingPlacement}
        >
          {typeof items === 'function'
            ? items({ close: () => { setIsOpen(false); } })
            : items}
        </MenuSelect>
      )}
    </>
  );
}, {
    Option: MenuSelect.Option,
    Static: MenuSelect.Static,
    Action: MenuSelect.Action,
    Link: MenuSelect.Link,
    Segment: MenuSelect.Segment,
    Group: MenuSelect.Group,
    Footer: MenuSelect.Footer,
  },
);

