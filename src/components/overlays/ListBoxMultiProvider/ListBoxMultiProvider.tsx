/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

// Utils
import { mergeProps, mergeRefs } from '../../../util/reactUtil.ts';
import {
  type UseFloatingElementOptions,
} from '../../util/overlays/floating-ui/useFloatingElement.tsx';

// Components
import { type ItemKey, type SelectedState, ListBoxMulti } from '../../forms/controls/ListBoxMulti/ListBoxMulti.tsx';
import {
  BaseAnchorRenderArgs,
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
//import cl from './ListBoxMultiProvider.module.scss';


//export { cl as ListBoxMultiProviderClassNames };
export type { ItemKey, SelectedState };

type ListBoxMultiProps = React.ComponentProps<typeof ListBoxMulti>;


export type AnchorRenderArgs = BaseAnchorRenderArgs & {
  selectedOptions: SelectedState,
};
export type ListBoxMultiProviderProps = Omit<ListBoxMultiProps, 'ref' | 'children' | 'label' | 'size'> & {
  /** A React ref to control the menu provider imperatively. */
  ref?: undefined | React.Ref<null | MenuProviderRef>,
  /** For controlled open state. */
  open?: undefined | boolean,
  /** When controlled, callback to set state. */
  onOpenChange?: undefined | ((isOpen: boolean) => void),
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
  role?: undefined | UseFloatingElementOptions['role'],
  
  /** The action that should trigger the menu to open. */
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'],
  
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
export const ListBoxMultiProvider = Object.assign((props: ListBoxMultiProviderProps) => {
  const {
    ref,
    open,
    onOpenChange,
    anchorRef,
    
    label,
    children,
    items,
    defaultSelected,
    selected,
    onSelectedChange,
    role = 'menu',
    triggerAction,
    menuSize,
    
    // Floating element props
    keyboardInteractions,
    placement,
    offset,
    enablePreciseTracking,
    
    ...propsRest
  } = props;
  
  const menuId = React.useId();
  const menuRef = React.useRef<React.ComponentRef<typeof ListBoxMulti>>(null);
  const previousActiveElementRef = React.useRef<HTMLElement>(null);
  
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
  
  // Allow passing a ref to control the state of the menu imperatively
  useMenuImperativeRef({ ref, floatingRef: refs.floating, isOpen, setIsOpen });
  
  // Controlled/uncontrolled state logic
  useMenuOpenControl({ setIsOpen, open });
  
  // Keyboard navigation logic
  const { toggleCauseRef, onAnchorKeyDown, onMenuKeyDown } = useMenuKeyboardNavigation({ setIsOpen, menuRef });
  
  const { handleToggle } = useMenuToggle({ menuRef, action: triggerAction, toggleCauseRef, previousActiveElementRef });
  
  const { internalSelected, handleInternalSelect } = useMenuSelect({
    previousActiveElementRef,
    setIsOpen,
    triggerAction,
    selected,
    defaultSelected,
    canCloseMenu: false,
  });
  
  const getRenderArgs = React.useCallback((base: BaseAnchorRenderArgs): AnchorRenderArgs => {
    return { ...base, selectedOptions: internalSelected };
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
  
  const floatingProps = getFloatingProps({
    popover: 'manual',
    style: floatingStyles,
    //className: cx(cl['bk-menu-provider__list-box']),
  });
  
  const selectedFromInternalSelected = React.useMemo(() => {
    return new Set(internalSelected.keys()); // 'null' for controlled
  }, [internalSelected]);
  
  const handleSelect = React.useCallback((selectedKeys: Set<ItemKey>) => {
    onSelectedChange?.(selectedKeys);
    handleInternalSelect(selectedKeys);
  }, [onSelectedChange, handleInternalSelect]);
  
  return (
    <>
      {anchor}
      {isMounted && (
        <ListBoxMulti
          {...mergeProps(
            floatingProps,
            propsRest,
            {
              ref: mergeRefs<React.ComponentRef<typeof ListBoxMulti>>(
                menuRef,
                refs.setFloating,
                floatingProps.ref as React.Ref<React.ComponentRef<typeof ListBoxMulti>>,
              ),
              onKeyDown: onMenuKeyDown,
              onToggle: handleToggle,
            },
          )}
          size={menuSize}
          label={label}
          selected={selectedFromInternalSelected}
          defaultSelected={defaultSelected}
          onSelectedChange={handleSelect}
          data-placement={floatingPlacement}
        >
          {typeof items === 'function'
            ? items({ close: () => { setIsOpen(false); } })
            : items
          }
        </ListBoxMulti>
      )}
    </>
  );
}, {
    Option: ListBoxMulti.Option,
    Static: ListBoxMulti.Static,
    Segment: ListBoxMulti.Segment,
    SegmentVirtual: ListBoxMulti.SegmentVirtual,
    Group: ListBoxMulti.Group,
    Footer: ListBoxMulti.Footer,
  },
);
