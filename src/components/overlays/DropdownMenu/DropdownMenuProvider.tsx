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
export type DropdownMenuProviderProps = Omit<ListBoxProps, 'children' | 'label'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** An accessible name for this dropdown menu. Required */
  label: string,
  
  /**
  * The content to render, which should contain the anchor. This should be a render prop which takes props to
  * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
  */
  children?: ((args: AnchorRenderArgs) => React.ReactNode) | React.ReactNode,
  
  /** The dropdown items. */
  items: React.ReactNode,
  
  /** The accessible role of the dropdown. */
  role?: undefined | UseFloatingElementOptions['role'],
  
  /** The action that should trigger the dropdown to open. */
  action?: undefined | UseFloatingElementOptions['action'],
  
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
      unstyled = false,
      label,
      children,
      items,
      selected,
      onSelect,
      role,
      action,
      keyboardInteractions,
      placement = 'bottom',
      offset = 8,
      enablePreciseTracking,
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
      isOpen,
      setIsOpen,
    } = useFloatingElement({
      role,
      action,
      keyboardInteractions,
      placement,
      offset,
      floatingUiFlipOptions: {
        fallbackAxisSideDirection: 'none',
        fallbackStrategy: 'initialPlacement',
      },
    });
    
    const [shouldMountDropdown] = useDebounce(isOpen, isOpen ? 0 : 1000);
    
    const selectedLabelRef = React.useRef<null | string>(null);
    const [selectedOptionInternal, setSelectedOptionInternal] = React.useState<null | ItemKey>(null);
    const selectedOption = typeof selected !== 'undefined' ? selected : selectedOptionInternal;
    const setSelectedOption = React.useCallback((itemKey: null | ItemKey) => {
      if (typeof selected === 'undefined') {
        setSelectedOptionInternal(itemKey);
      }
      
      onSelect?.(itemKey, itemKey === null ? null : { itemKey, label: (selectedLabelRef.current ?? '') });
    }, [selected, onSelect]);
    
    const toggleCause = React.useRef<null | 'ArrowUp' | 'ArrowDown'>(null);
    const handleAnchorKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        toggleCause.current = event.key; // Store for later use in `handleToggle`
        event.preventDefault(); // Prevent scrolling
        setIsOpen(true);
        
        if (action === 'focus') {
          const listBoxElement = listBoxRef.current;
          if (!listBoxElement) { return; }
          
          if (event.key === 'ArrowDown') {
            listBoxElement._bkListBoxFocusFirst();
          } else if (event.key === 'ArrowUp') {
            listBoxElement._bkListBoxFocusLast();
          }
        }
      }
    }, [setIsOpen, action]);
    
    const renderAnchor = () => {
      // FIXME: make `React.HTMLProps<Element>` generic, since not all component props extend from this type
      const anchorProps: AnchorRenderArgs['props'] = (userProps?: undefined | React.HTMLProps<Element>) => {
        const userPropsRef: undefined | string | React.Ref<Element> = userProps?.ref ?? undefined;
        if (typeof userPropsRef === 'string') {
          // We can't merge refs if one of the refs is a string
          console.error(`Failed to render DropdownMenuProvider, due to use of legacy string ref`);
          return (userProps ?? {}) as Record<string, unknown>;
        }
        
        const props = getReferenceProps(userProps);
        return {
          ...props,
          ref: userPropsRef ? mergeRefs(anchorRef, userPropsRef, refs.setReference) : refs.setReference,
          'aria-controls': listBoxId,
          'aria-haspopup': 'listbox',
          'aria-expanded': isOpen,
          // biome-ignore lint/suspicious/noExplicitAny: `onKeyDown` should be a function here
          onKeyDown: mergeCallbacks([handleAnchorKeyDown, props.onKeyDown as any]),
        };
      };
      
      if (typeof children === 'function') {
        return children({
          props: anchorProps,
          open: isOpen,
          requestOpen: () => { setIsOpen(true); },
          close: () => { setIsOpen(false); },
          selectedOption: selectedOption === null
            ? null
            : { itemKey: selectedOption, label: (selectedLabelRef.current ?? '') },
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
    
    const handleSelect = React.useCallback((_key: null | ListBox.ItemKey, itemDetails: null | ListBox.ItemDetails) => {
      selectedLabelRef.current = itemDetails?.label ?? null;
      setSelectedOption(itemDetails?.itemKey ?? null);
      
      // Note: add a slight delay before closing, to make it less jarring (and allow "select" animations to complete)
      window.setTimeout(() => {
        const previousActiveElement = previousActiveElementRef.current;
        
        if (previousActiveElement) {
          previousActiveElement.focus({
            // @ts-ignore Supported in some browsers (e.g. Firefox).
            focusVisible: false,
          });
        }
        
        if (action !== 'focus') {
          setIsOpen(false);
        }
      }, 150);
    }, [setIsOpen, setSelectedOption, action]);
    
    // Focus management (focus on open + restore focus on close)
    const previousActiveElementRef = React.useRef<null | HTMLElement>(null);
    const handleToggle = React.useCallback((event: React.ToggleEvent) => {
      const listBoxElement = listBoxRef.current;
      if (!listBoxElement) { return; }
      
      if (event.oldState === 'closed' && event.newState === 'open') {
        if (document.activeElement instanceof HTMLElement) {
          previousActiveElementRef.current = document.activeElement;
        }
        
        // For click actions, move focus to the list box upon toggling
        if (action !== 'click') { return; }
        
        if (toggleCause.current === 'ArrowDown') {
          listBoxElement._bkListBoxFocusFirst();
        } else if (toggleCause.current === 'ArrowUp') {
          listBoxElement._bkListBoxFocusLast();
        } else {
          listBoxElement.focus();
        }
        toggleCause.current = null;
      } else if (event.oldState === 'open' && event.newState === 'closed') {
        const previousActiveElement = previousActiveElementRef.current;
        
        if (previousActiveElement && listBoxElement.matches(':focus-within')) {
          previousActiveElement.focus({
            // @ts-ignore Supported in some browsers (e.g. Firefox).
            focusVisible: false,
          });
        }
      }
    }, [action]);
    
    const handleDropdownKeyDown = React.useCallback((event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        const selectedOptionDetails = selectedOption === null
          ? null
          : { itemKey: selectedOption, label: (selectedLabelRef.current ?? '') };
        handleSelect(selectedOption, selectedOption === null ? null : selectedOptionDetails);
      }
      
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }, [selectedOption, handleSelect, setIsOpen]);
    
    const renderDropdown = () => {
      const floatingProps = getFloatingProps({
        popover: 'manual',
        style: floatingStyles,
        ...propsRest,
        className: cx(cl['bk-dropdown-menu-provider__list-box'], propsRest.className),
        onKeyDown: mergeCallbacks([handleDropdownKeyDown, propsRest.onKeyDown]),
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
          selected={selectedOption}
          onSelect={handleSelect}
          onToggle={handleToggle}
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
