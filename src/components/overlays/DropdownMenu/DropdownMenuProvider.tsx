/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { mergeRefs } from '../../../util/reactUtil.ts';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { useListNavigation, type Placement } from '@floating-ui/react';
import { usePopover } from '../../util/Popover/Popover.tsx';

import { DropdownMenuContext, type OptionKey, type OptionDef, Action, Option, DropdownMenu } from './DropdownMenu.tsx';

import cl from './DropdownMenuProvider.module.scss';


export { cl as DropdownMenuClassNames };


export type AnchorRenderArgs = {
  props: (userProps?: undefined | React.HTMLProps<Element>) => Record<string, unknown>,
  state: DropdownMenuContext,
};
export type DropdownMenuProviderProps = Omit<ComponentProps<typeof DropdownMenu>, 'children'> & {
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
};
/**
 * Provider for a dropdown menu overlay with its trigger.
 */
export const DropdownMenuProvider = Object.assign(
  (props: DropdownMenuProviderProps) => {
    const { children, unstyled = false, items, placement = 'bottom', enablePreciseTracking, ...propsRest } = props;
    
    const selectedRef = React.useRef<React.ElementRef<typeof Option>>(null);
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
      setIsOpen,
    } = usePopover({
      placement: placement,
      offset: 8,
      floatingUiFlipOptions: {
        fallbackAxisSideDirection: 'none',
        fallbackStrategy: 'initialPlacement',
      },
      floatingUiInteractions: context => [
        useListNavigation(context, {
          listRef,
          activeIndex,
          onNavigate: setActiveIndex,
        }),
      ],
    });
    
    const context: DropdownMenuContext = React.useMemo((): DropdownMenuContext => ({
      optionProps: () => getItemProps(),
      selectedOption: selected?.optionKey ?? null,
      selectOption: (option: OptionDef) => {
        setSelected(option);
        setIsOpen(false);
        selectedRef.current?.focus(); // Return focus
      },
      close: () => { setIsOpen(false); },
    }), [selected, selectedRef]);
    
    const renderAnchor = () => {
      const anchorProps: AnchorRenderArgs['props'] = (userProps?: undefined | React.HTMLProps<Element>) => {
        const userPropsRef: undefined | string | React.Ref<any> = userProps?.ref ?? undefined;
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
        return children({ props: anchorProps, state: context });
      }
      
      // If a render prop is not used, try to attach it to the element directly.
      // NOTE: `cloneElement` is marked as a legacy function by React. Recommended is to use a render prop instead.
      if (!React.isValidElement(children)) {
        return <span {...anchorProps()}>{children}</span>;
      }
      if (React.Children.count(children) === 1) {
        return React.cloneElement(children, anchorProps(children.props));
      }
      
      console.error(`Invalid children passed to DropdownMenuProvider, expected a render prop or single child element.`);
      return children;
    };
    
    return (
      // @ts-ignore React 19
      <DropdownMenuContext value={context}>
        {renderAnchor()}
        
        <DropdownMenu
          {...getFloatingProps({
            popover: 'manual',
            style: floatingStyles,
            ...propsRest,
            className: cx(propsRest.className),
          })}
          tabIndex={undefined}
          ref={mergeRefs(refs.setFloating as any, propsRest.ref)}
          data-placement={placementEffective}
        >
          {items}
        </DropdownMenu>
        {/* <Button variant="primary"
          {...propsRest}
          className={cx(
            'bk',
            { [cl['bk-dropdown']]: !unstyled },
            propsRest.className,
          )}
          {...getReferenceProps()}
          ref={mergeRefs(selectedRef, refs.setReference as any)}
        >
          {context.selectedOption ? `Selected: ${context.selectedOption}` : 'Open dropdown'}
        </Button> */}
        {/* <ul
          ref={refs.setFloating}
          data-placement={placement}
          {...getFloatingProps({
            popover: 'manual',
            style: floatingStyles,
            className: cl['bk-dropdown__dropdown'],
          })}
          tabIndex={undefined} // Overwrite `tabIndex={-1}` so that we don't allow programmatic focus
        >
          {children}
        </ul> */}
      </DropdownMenuContext>
    );
  },
  { Action, Option },
);
