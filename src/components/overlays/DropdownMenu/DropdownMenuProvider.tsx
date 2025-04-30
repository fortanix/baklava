/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeCallbacks, mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import { useDebounce } from '../../../util/hooks/useDebounce.ts';

import {
  type UseFloatingElementOptions,
  useFloatingElement,
} from '../../util/overlays/floating-ui/useFloatingElement.tsx';

import * as ListBox from '../../forms/controls/ListBox/ListBox.tsx';

import cl from './DropdownMenuProvider.module.scss';


export type ItemDetails = ListBox.ItemDetails;
export type ItemKey = ListBox.ItemKey;

type ListBoxProps = ComponentProps<typeof ListBox.ListBox>;
export type AnchorRenderArgs = {
  props: (userProps?: undefined | React.HTMLProps<Element>) => Record<string, unknown>,
  open: boolean,
  requestOpen: () => void, // FIXME: better naming
  close: () => void,
  selectedOption: null | ListBox.ItemDetails,
};
export type DropdownMenuProviderProps = Omit<ListBoxProps, 'children' | 'label' | 'selected' > & {
  /** An accessible name for this dropdown menu. Required */
  label: string,
  
  /**
  * The content to render, which should contain the anchor. This should be a render prop which takes props to
  * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
  */
  children?: ((args: AnchorRenderArgs) => React.ReactNode) | React.ReactNode,
  
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** The dropdown items. */
  items: React.ReactNode,
  
  /** The accessible role of the dropdown. */
  role?: undefined | UseFloatingElementOptions['role'],
  
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
  
  /** Offset size for the dropdown relative to the anchor. */
  offset?: undefined | UseFloatingElementOptions['offset'],
  
  /** Enable more precise tracking of the anchor, at the cost of performance. */
  enablePreciseTracking?: undefined | UseFloatingElementOptions['enablePreciseTracking'],
};
/**
 * Provider for a dropdown menu overlay with its trigger.
 */
export const DropdownMenuProvider = Object.assign(
  (props: DropdownMenuProviderProps) => {
    const {
      label,
      children,
      unstyled = false,
      items,
      role,
      keyboardInteractions,
      placement = 'bottom',
      offset = 8,
      enablePreciseTracking,
      onSelect,
      ...propsRest
    } = props;
    
    const anchorRef = React.useRef<HTMLElement>(null);
    const listBoxRef = React.useRef<React.ComponentRef<typeof ListBox.ListBox>>(null);
    const listBoxId = `listbox-${React.useId()}`;
    
    const {
      refs,
      placement: placementEffective,
      floatingStyles,
      getReferenceProps,
      getFloatingProps,
      getItemProps,
      isOpen,
      setIsOpen,
    } = useFloatingElement({
      role,
      keyboardInteractions,
      placement,
      offset,
      floatingUiFlipOptions: {
        fallbackAxisSideDirection: 'none',
        fallbackStrategy: 'initialPlacement',
      },
    });
    
    const [shouldMountDropdown] = useDebounce(isOpen, isOpen ? 0 : 1000);
    
    const [selectedOption, setSelectedOption] = React.useState<null | ListBox.ItemDetails>(null);
    
    const renderAnchor = () => {
      const anchorProps: AnchorRenderArgs['props'] = (userProps?: undefined | React.HTMLProps<Element>) => {
        const userPropsRef: undefined | string | React.Ref<Element> = userProps?.ref ?? undefined;
        if (typeof userPropsRef === 'string') {
          // We can't merge refs if one of the refs is a string
          console.error(`Failed to render DropdownMenuProvider, due to use of legacy string ref`);
          return (userProps ?? {}) as Record<string, unknown>;
        }
        
        return {
          ...getReferenceProps(userProps),
          ref: userPropsRef ? mergeRefs(anchorRef, userPropsRef, refs.setReference) : refs.setReference,
          'aria-controls': listBoxId,
          'aria-haspopup': 'listbox',
          'aria-expanded': isOpen,
        };
      };
      
      if (typeof children === 'function') {
        return children({
          props: anchorProps,
          open: isOpen,
          requestOpen: () => { setIsOpen(true); },
          close: () => { setIsOpen(false); },
          selectedOption,
        });
      }
      
      // If a render prop is not used, try to attach it to the element directly.
      // NOTE: `cloneElement` is marked as a legacy function by React. Recommended is to use a render prop instead.
      if (!React.isValidElement(children)) {
        return <span {...anchorProps()}>{children}</span>;
      }
      if (React.Children.count(children) === 1) {
        return React.cloneElement(children, anchorProps(children.props as React.HTMLProps<Element>));
      }
      
      console.error(`Invalid children passed to DropdownMenuProvider, expected a render prop or single child element.`);
      return children;
    };
    
    const handleSelect = React.useCallback((itemDetails: null | ListBox.ItemDetails) => {
      setSelectedOption(itemDetails);
      
      // Note: add a slight delay before closing, to make it less jarring (and allow "select" animations to run)
      window.setTimeout(() => {
        setIsOpen(false);
      }, 150);
    }, [setIsOpen]);
    
    const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSelect(selectedOption);
      }
    }, [selectedOption, handleSelect]);
    
    const renderDropdown = () => {
      const floatingProps = getFloatingProps({
        popover: 'manual',
        style: floatingStyles,
        ...propsRest,
        className: cx(cl['bk-dropdown-menu-provider__list-box'], propsRest.className),
        onKeyDown: mergeCallbacks([handleKeyDown, propsRest.onKeyDown]),
      });
      
      return (
        <ListBox.ListBox
          label={label}
          {...floatingProps}
          ref={mergeRefs<React.ComponentRef<typeof ListBox.ListBox>>(
            listBoxRef,
            refs.setFloating,
            floatingProps.ref as React.Ref<React.ComponentRef<typeof ListBox.ListBox>>,
            propsRest.ref,
          )}
          id={listBoxId}
          selected={selectedOption?.itemKey ?? null}
          onSelect={mergeCallbacks([handleSelect, onSelect])}
          data-placement={placementEffective}
        >
          {items}
        </ListBox.ListBox>
      );
    };
    
    return (
      <>
        {renderAnchor()}
        {shouldMountDropdown && renderDropdown()}
      </>
    );
  },
  {
    Option: ListBox.Option,
    Action: ListBox.Action,
    Header: ListBox.Header,
    FooterActions: ListBox.FooterActions,
  },
);
