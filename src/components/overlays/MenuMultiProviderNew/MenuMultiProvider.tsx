/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

// Utils
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { mergeCallbacks, mergeRefs } from '../../../util/reactUtil.ts';
import { useDebounce } from '../../../util/hooks/useDebounce.ts';
import {
  type UseFloatingElementOptions,
  UseFloatingElementResult,
  useFloatingElement,
} from '../../util/overlays/floating-ui/useFloatingElement.tsx';

// Components
import * as ListBoxMulti from '../../forms/controls/ListBoxMulti/ListBoxMulti.tsx';
import {
  AnchorRenderArgs,
  MenuProviderRef,
  useFloatingMenu,
  useMenuAnchor,
  useMenuImperativeRef,
  useMenuKeyboardNavigation,
  useMenuListBoxFocus,
  useMenuOpenControl,
  useMenuToggle,
} from '../MenuProviderNew/MenuProvider.tsx';

// Styles
import { MenuProviderClassNames as cl } from '../MenuProvider/MenuProvider.tsx';


export type ItemDetails = ListBoxMulti.ItemDetails;
export type ItemKey = ListBoxMulti.ItemKey;
type ListBoxMultiProps = ComponentProps<typeof ListBoxMulti.ListBoxMulti>;

/**
 * MENU SELECT HANDLER
 * ---------------------------------------------------------------------------------------------------------------------
 */
const getLabel = (
  selected?: undefined | ListBoxMultiProps['selected'],
  formatItemLabel?: undefined | ListBoxMultiProps['formatItemLabel'],
): Map<ListBoxMulti.ItemKey, string> => {
  if (selected) {
    return new Map([...selected].map(k => [k, formatItemLabel?.(k) ?? String(k)]));
  }

  return new Map();
};

type UseMenuSelectHandlerOptions = {
  previousActiveElementRef: React.RefObject<HTMLElement | null>,
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'];
  selected?: undefined | ListBoxMultiProps['selected'],
  defaultSelected?: undefined | ListBoxMultiProps['defaultSelected'],
  formatItemLabel?: undefined | ListBoxMultiProps['formatItemLabel'],
  onSelect?: undefined | ListBoxMultiProps['onSelect'];
};
export const useMenuSelect = (options: UseMenuSelectHandlerOptions) => {
  const {
    previousActiveElementRef,
    triggerAction = 'click',
    selected,
    defaultSelected,
    formatItemLabel,
    onSelect,
  } = options;

  const [internal, setInternal] = React.useState<Set<ListBoxMulti.ItemKey>>(selected ?? defaultSelected ?? new Set());
  const selectedLabelRef = React.useRef<Map<ListBoxMulti.ItemKey, string>>(getLabel(internal, formatItemLabel));
  const isControlled = typeof selected !== 'undefined';

  React.useEffect(() => {
    if (isControlled) {
      // In controlled mode, keep internal state in sync with the parent-controlled value
      setInternal(selected);
      selectedLabelRef.current = getLabel(selected, formatItemLabel);
    }
  }, [isControlled, selected, formatItemLabel]);

  const handleSelect = React.useCallback((
    _selectedKeys: Set<ListBoxMulti.ItemKey>,
    itemDetails: Map<ListBoxMulti.ItemKey, ListBoxMulti.ItemDetails>,
  ) => {
    const label = new Map([...itemDetails.entries()].map(([itemKey, details]) => [itemKey, details.label]));
    const itemKeys = new Set(itemDetails.keys());
    onSelect?.(itemKeys, itemDetails);

    if (!isControlled) {
      // When not controlled by the parent, update the internal selection state directly
      setInternal(itemKeys);
      selectedLabelRef.current = label;
    }
  }, [triggerAction, onSelect, previousActiveElementRef, isControlled]);

  return {
    internalSelected: internal,
    selectedLabelRef,
    handleSelect,
    setInternalSelected: setInternal,
    isControlled,
  };
};

/**
 * MENU PROVIDER
 * Provider for a menu overlay that is triggered by (and positioned relative to) some anchor element.
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type MenuProviderProps<TSelected> = Omit<ListBoxMultiProps, 'ref' | 'children' | 'label' | 'size'> & {
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
  label: string;

  /**
  * The content to render, which should contain the anchor. This should be a render prop which takes props to
  * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
  */
  children?: undefined | ((args: AnchorRenderArgs<TSelected>) => React.ReactNode | React.ReactNode);

  /** The menu items. */
  items: React.ReactNode | ((args: { close: () => void }) => React.ReactNode);

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
export const MenuMultiProvider = Object.assign((
  props: MenuProviderProps<Map<ListBoxMulti.ItemKey, ListBoxMulti.ItemDetails>>,
) => {
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
    formatItemLabel,

    ref,
    open,
    onOpenChange,
    anchorRef,

    ...propsRest
  } = props;

  const listBoxRef = React.useRef<React.ComponentRef<typeof ListBoxMulti.ListBoxMulti>>(null);
  const listBoxId = `listbox-${React.useId()}`;
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null);

  const {
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
  const { shouldMountMenu } = useMenuOpenControl({ isOpen, setIsOpen, open });
  const { toggleCauseRef, onAnchorKeyDown, onMenuKeyDown } = useMenuKeyboardNavigation({ setIsOpen, listBoxRef });
  const { handleToggle } = useMenuToggle({ listBoxRef, action, toggleCauseRef, previousActiveElementRef });
  const { listBoxFocusRef } = useMenuListBoxFocus({ setIsOpen });
  const { internalSelected, selectedLabelRef, handleSelect } = useMenuSelect({
    previousActiveElementRef,
    triggerAction: triggerAction ?? action,
    onSelect,
    formatItemLabel,
    selected,
    defaultSelected,
  });
  const { anchor } = useMenuAnchor<Map<ListBoxMulti.ItemKey, ListBoxMulti.ItemDetails>>({
    children,
    isOpen,
    setIsOpen,
    listBoxId,
    getReferenceProps,
    refs,
    onKeyDown: onAnchorKeyDown,
    selected: new Map([...internalSelected.values()].map(k => [k, { label: selectedLabelRef.current.get(k) ?? k }])),
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

  const mergedListBoxRef = mergeRefs<React.ComponentRef<typeof ListBoxMulti.ListBoxMulti>>(
    listBoxRef,
    listBoxFocusRef,
    refs.setFloating,
    floatingProps.ref as React.Ref<React.ComponentRef<typeof ListBoxMulti.ListBoxMulti>>,
  );

  return (
    <>
      {anchor}
      {shouldMountMenu && (
        <ListBoxMulti.ListBoxMulti
          {...floatingProps}
          {...propsRest}
          ref={mergedListBoxRef}
          size={menuSize}
          label={label}
          selected={internalSelected}
          defaultSelected={defaultSelected}
          onSelect={handleSelect}
          onToggle={handleToggle}
          data-placement={floatingPlacement}
        >
          {typeof items === 'function'
            ? items({ close: () => { setIsOpen(false); } })
            : items}
        </ListBoxMulti.ListBoxMulti>
      )}
    </>
  );
}, {
    Static: ListBoxMulti.Static,
    Option: ListBoxMulti.Option,
    Action: ListBoxMulti.Action,
    Header: ListBoxMulti.Header,
    FooterActions: ListBoxMulti.FooterActions,
  },
);

