/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assertUnreachable } from '../../../util/types.ts';
import { classNames as cx, type ClassNameArgument } from '../../../util/componentUtil.ts';
import { mergeRefs } from '../../../util/reactUtil.ts';
import * as React from 'react';

import { usePopover, usePopoverArrow } from '../../util/Popover/Popover.tsx';
import { type TooltipProps, TooltipClassNames, Tooltip } from './Tooltip.tsx';


export type GetReferenceProps = (userProps?: undefined | React.HTMLProps<Element>) => Record<string, unknown>;
export type TooltipProviderProps = Omit<TooltipProps, 'children'> & {
  /**
   * The content to render, which should contain the anchor. This should be a render prop which takes props to
   * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
   */
  children?: ((getReferenceProps: GetReferenceProps) => React.ReactNode) | React.ReactNode,
  
  /**
   * The tooltip message. If nullish, the tooltip will not be shown at all. This is useful in case the tooltip should
   * be shown conditionally.
   */
  tooltip?: null | React.ReactNode,

  /** Where to show the tooltip relative to the anchor. */
  // here we are not using Placement as exposed from Popover because Tooltip only supports a subset of Popover's default placements.
  placement?: undefined | 'top' | 'bottom' | 'left' | 'right',
  
  /** Enable more precise tracking of the anchor, at the cost of performance. */
  enablePreciseTracking?: undefined | boolean,
  
  /** A custom boundary to use to determine overflow of the tooltip. */
  boundary?: undefined | Element,
  
  /** Callback that is invoked when the tooltip gets activated. */
  onTooltipActivated?: () => void,
  
  /** Callback that is invoked when the tooltip gets deactivated. */
  onTooltipDeactivated?: () => void,
};
/**
 * Provider around an anchor element to attach a tooltip popover.
 */
export const TooltipProvider = (props: TooltipProviderProps) => {
  const {
    children,
    tooltip,
    placement,
    size,
    enablePreciseTracking = false,
    boundary,
    onTooltipActivated,
    onTooltipDeactivated,
    ...tooltipProps
  } = props;
  
  const arrowRef = React.useRef<HTMLElement>(null);
  
  const {
    context,
    isMounted,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    placement: activePlacement,
  } = usePopover({
    action: 'hover',
    placement,
    offset: 14,
    enablePreciseTracking,
    boundary,
    ...(arrowRef.current ? { arrowRef:  arrowRef as React.RefObject<HTMLElement> } : {}),
  });
  const arrow = usePopoverArrow({ context });
  
  // Call event listeners, if any
  React.useLayoutEffect(() => {
    if (isMounted) {
      onTooltipActivated?.();
    } else {
      onTooltipDeactivated?.();
    }
  }, [isMounted, onTooltipActivated, onTooltipDeactivated]);
  
  const renderTooltip = () => {
    if (!isMounted || !tooltip) { return null; }
    
    const arrowClassName = (() => {
      const placement = activePlacement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
      switch (placement) {
        case 'top': return cx(TooltipClassNames['bk-tooltip--arrow'], TooltipClassNames['bk-tooltip--arrow-bottom']);
        case 'right': return cx(TooltipClassNames['bk-tooltip--arrow'], TooltipClassNames['bk-tooltip--arrow-left']);
        case 'bottom': return cx(TooltipClassNames['bk-tooltip--arrow'], TooltipClassNames['bk-tooltip--arrow-top']);
        case 'left': return cx(TooltipClassNames['bk-tooltip--arrow'], TooltipClassNames['bk-tooltip--arrow-right']);
        default: return assertUnreachable(placement);
      }
    })();
    
    const arrowPos = ((): string | number => {
      const placement = activePlacement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
      
      console.log(arrow);
      
      switch (placement) {
        case 'top':
        case 'bottom': {
          const x = arrow?.arrowX ?? '50%';
          return `calc(${x} + 15px)`;
        }
        case 'right':
        case 'left': {
          const y = arrow?.arrowY ?? '50%';
          return `calc(${y} + 20px)`;
        }
        default: return assertUnreachable(placement);
      }
    })();
    
    const floatingProps = getFloatingProps({
      popover: 'manual',
      style: floatingStyles,
    });
    return (
      <Tooltip
        {...floatingProps}
        ref={mergeRefs<HTMLDivElement>(refs.setFloating, tooltipProps.ref)}
        className={cx(
          floatingProps.className as ClassNameArgument,
          arrowClassName,
          tooltipProps.className,
        )}
        style={{
          ...(floatingProps.style ?? {}),
          ...tooltipProps.style,
          '--arrow-pos': arrowPos,
        } as React.CSSProperties}
        size={size}
      >
        {tooltip}
        {/*
        Fake arrow element for position tracking, the real arrow is drawn using `border-image`.
        Note: `floating-ui` has a `FloatingArrow` component using a positioned <svg> arrow, but this doesn't work if
        the tooltip has `overflow: hidden/scroll/auto` or `contain: paint` enabled.
        */}
        <span ref={arrowRef} hidden aria-hidden/>
      </Tooltip>
    );
  };
  
  const renderAnchor = () => {
    const renderPropArg: GetReferenceProps = (userProps?: undefined | React.HTMLProps<Element>) => {
      const userPropsRef: undefined | string | React.Ref<Element> = userProps?.ref ?? undefined;
      if (typeof userPropsRef === 'string') {
        // We can't merge refs if one of the refs is a string
        console.error(`Failed to render Tooltip, due to use of legacy string ref`);
        return (userProps ?? {}) as Record<string, unknown>;
      }
      
      return {
        ...getReferenceProps(userProps),
        ref: userPropsRef ? mergeRefs(userPropsRef, refs.setReference) : refs.setReference,
      };
    };
    
    if (typeof children === 'function') {
      return children(renderPropArg);
    }
    
    // If a render prop is not used, try to attach it to the element directly.
    // NOTE: `cloneElement` is marked as a legacy function by React. Recommended is to use a render prop instead.
    if (!React.isValidElement(children)) {
      return <span {...renderPropArg()}>{children}</span>;
    }
    if (React.Children.count(children) === 1) {
      return React.cloneElement(children, renderPropArg(children.props as React.HTMLProps<Element>));
    }
    
    console.error(`Invalid children passed to TooltipContainer, expected a render prop or single child element.`);
    return children;
  };
  
  return (
    <>
      {renderTooltip()}
      {renderAnchor()}
    </>
  );
};
