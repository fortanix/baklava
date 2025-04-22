/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { useListNavigation, type Placement } from '@floating-ui/react';
import { useFloatingElement } from '../../util/overlays/floating-ui/useFloatingElement.tsx';

import { DropdownMenuContext, type OptionDef, Option, Action, DropdownMenu } from './DropdownMenu.tsx';


export type AnchorRenderArgs = {
  props: (userProps?: undefined | React.HTMLProps<Element>) => Record<string, unknown>,
  open: boolean,
  state: DropdownMenuContext,
};
export type DropdownMenuProviderProps = Omit<ComponentProps<typeof DropdownMenu>, 'children' | 'label'> & {
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
  
  /** Override the default placement */
  placement?: undefined | Placement,
  
  /** Enable more precise tracking of the anchor, at the cost of performance. */
  enablePreciseTracking?: undefined | boolean,
  
  /** For controlled open state. */
  open?: boolean,

  /** When controlled, callback to set state. */
  onOpenChange?: (isOpen: boolean) => void,

  /** (optional) Use an existing DOM node as the positioning anchor. */
  anchorRef?: React.RefObject<HTMLElement | null>,
};

export type DropdownRef = {
  setIsOpen: (open: boolean) => void,
  isOpen: boolean,
  floatingEl: HTMLElement | null,
};

/**
 * Provider for a dropdown menu overlay with its trigger.
 */
export const DropdownMenuProvider = Object.assign(
  React.forwardRef<DropdownRef, DropdownMenuProviderProps>((props, ref) => {
    const {
      label,
      children,
      unstyled = false,
      items,
      placement = 'bottom',
      enablePreciseTracking,
      open: controlledOpen,
      onOpenChange: controlledOnOpenChange,
      anchorRef,
      ...propsRest
    } = props;
    
    const selectedRef = React.useRef<React.ComponentRef<typeof Option>>(null);
    const [selected, setSelected] = React.useState<null | OptionDef>(null);
    
    const listRef = React.useRef([]);
    const [activeIndex, setActiveIndex] = React.useState<null | number>(null);
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
      placement: placement,
      offset: 8,
      floatingUiFlipOptions: {
        fallbackAxisSideDirection: 'none',
        fallbackStrategy: 'initialPlacement',
      },
      floatingUiOptions: {
        ...(
          typeof controlledOpen !== 'undefined' ?
            {
              open: controlledOpen,
              ...(
                typeof controlledOnOpenChange !== 'undefined' ?
                  { onOpenChange: controlledOnOpenChange } : {}
              ),

            } : {}
        ),
      },
      floatingUiInteractions: context => [
        useListNavigation(context, {
          listRef,
          activeIndex,
          onNavigate: setActiveIndex,
        }),
      ],
    });

    // keep internal state in sync with the controlled prop
    React.useEffect(() => {
      if (controlledOpen !== undefined) {
        setIsOpen(controlledOpen);
      }
    }, [controlledOpen, setIsOpen]);

    // Use external element as the reference, if provided
    React.useLayoutEffect(() => {
      if (anchorRef?.current) {
        refs.setReference(anchorRef.current);
      }
    }, [anchorRef?.current, refs.setReference]);

    const dropdownRef = React.useMemo<DropdownRef>(() => ({
      isOpen,
      setIsOpen,
      get floatingEl() {
        return refs.floating.current;
      },
    }), [isOpen, setIsOpen, refs.floating]);

    React.useImperativeHandle(ref, () => dropdownRef, [dropdownRef]);

    const context: DropdownMenuContext = React.useMemo((): DropdownMenuContext => ({
      optionProps: () => getItemProps(),
      selectedOption: selected?.optionKey ?? null,
      selectOption: (option: OptionDef) => {
        setSelected(option);
        setIsOpen(false);
        selectedRef.current?.focus(); // Return focus
      },
      close: () => { setIsOpen(false); },
    }), [selected, setIsOpen, getItemProps]);
    
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
          ref: userPropsRef ? mergeRefs(userPropsRef, refs.setReference) : refs.setReference,
        };
      };
      
      if (typeof children === 'function') {
        return children({ props: anchorProps, open: isOpen, state: context });
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
    
    return (
      <DropdownMenuContext value={context}>
        {renderAnchor()}
        
        <DropdownMenu
          label={label}
          {...getFloatingProps({
            popover: 'manual',
            style: floatingStyles,
            ...propsRest,
            className: cx(propsRest.className),
          })}
          ref={mergeRefs<HTMLUListElement>(refs.setFloating, propsRest.ref)}
          data-placement={placementEffective}
        >
          {items}
        </DropdownMenu>
      </DropdownMenuContext>
    );
  }),
  { Action, Option },
);
