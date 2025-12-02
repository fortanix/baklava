/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { assertUnreachable } from '../../../util/types.ts';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { classNames as cx, type ClassNameArgument } from '../../../util/componentUtil.ts';
import { mergeRefs, mergeProps } from '../../../util/reactUtil.ts';

import {
  type UseFloatingElementOptions,
  useFloatingElement,
  useFloatingElementArrow,
} from '../../util/overlays/floating-ui/useFloatingElement.tsx';
import { type TooltipProps, TooltipClassNames, Tooltip } from './Tooltip.tsx';

import cl from './TooltipProvider.module.scss';


type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export type GetReferenceProps = (userProps?: undefined | React.HTMLProps<Element>) => Record<string, unknown>;
export type TooltipProviderProps = Omit<TooltipProps, 'children'> & {
  /**
   * The content to render, which should contain the anchor. Should be defined as a render prop which takes props to
   * apply on the anchor element. Alternatively, a single element can be provided to which the props are applied.
   */
  children?: ((getReferenceProps: GetReferenceProps) => React.ReactNode) | React.ReactNode,
  
  /**
   * The tooltip message. If `null`, the tooltip will not be shown at all (useful in case the tooltip should be shown
   * conditionally).
   */
  tooltip: null | React.ReactNode | (() => React.ReactNode),
  
  /** The action that should trigger the menu to open. Default: `'hover'`. */
  triggerAction?: undefined | UseFloatingElementOptions['triggerAction'],
  
  /** Where to show the tooltip, relative to the anchor. */
  placement?: undefined | TooltipPlacement,
  
  /** Enable more precise tracking of the anchor, at the cost of performance. Default: `false`. */
  enablePreciseTracking?: undefined | boolean,
  
  /** A custom boundary to use to determine overflow of the tooltip. */
  boundary?: undefined | Element,
  
  /** Callback that is invoked when the tooltip gets activated. */
  onTooltipActivated?: undefined | (() => void),
  
  /** Callback that is invoked when the tooltip gets deactivated. */
  onTooltipDeactivated?: undefined | (() => void),
};
/**
 * Provider around an anchor element to attach a tooltip popover.
 */
export const TooltipProvider = (props: TooltipProviderProps) => {
  const {
    children,
    tooltip,
    triggerAction = 'hover',
    placement,
    size,
    enablePreciseTracking = false,
    boundary,
    onTooltipActivated,
    onTooltipDeactivated,
    ...tooltipProps
  } = props;
  
  const arrowRef = React.useRef<HTMLElement>(null);
  
  const floatingElement = useFloatingElement({
    role: 'tooltip',
    triggerAction,
    keyboardInteractions: 'default',
    placement,
    offset: 14,
    enablePreciseTracking,
    boundary,
    ...(arrowRef.current ? { arrowRef: arrowRef as React.RefObject<HTMLElement> } : {}),
  });
  const {
    context,
    isMounted,
    isOpen,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    placement: activePlacement,
  } = floatingElement;
  
  const arrow = useFloatingElementArrow({ context });
  
  // Call event listeners, if any
  React.useLayoutEffect(() => {
    if (isMounted) {
      onTooltipActivated?.();
    } else {
      onTooltipDeactivated?.();
    }
  }, [isMounted, onTooltipActivated, onTooltipDeactivated]);
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: Depend on `isOpen` to rerender content on open
  const tooltipContent = React.useMemo(() => {
    return typeof tooltip === 'function' ? tooltip() : tooltip;
  }, [tooltip, isOpen]);
  
  const floatingProps = getFloatingProps({
    popover: 'manual',
    style: floatingStyles,
  });
  
  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to exclude `tooltipProps`
  const tooltipRendered = React.useMemo(() => {
    if (!isMounted || !tooltipContent) { return null; }
    
    const arrowClassName = (() => {
      const placement = activePlacement.split('-')[0] as TooltipPlacement;
      switch (placement) {
        case 'top': return cx(TooltipClassNames['bk-tooltip--arrow'], TooltipClassNames['bk-tooltip--arrow-bottom']);
        case 'right': return cx(TooltipClassNames['bk-tooltip--arrow'], TooltipClassNames['bk-tooltip--arrow-left']);
        case 'bottom': return cx(TooltipClassNames['bk-tooltip--arrow'], TooltipClassNames['bk-tooltip--arrow-top']);
        case 'left': return cx(TooltipClassNames['bk-tooltip--arrow'], TooltipClassNames['bk-tooltip--arrow-right']);
        default: return assertUnreachable(placement);
      }
    })();
    
    const arrowPos = ((): string | number => {
      const placement = activePlacement.split('-')[0] as TooltipPlacement;
      
      switch (placement) {
        case 'top':
        case 'bottom':
          return arrow?.arrowX ?? '50%';
        case 'right':
        case 'left':
          return arrow?.arrowY ?? '50%';
        default:
          return assertUnreachable(placement);
      }
    })();
    
    return (
      <Tooltip
        {...mergeProps(floatingProps, tooltipProps)}
        ref={mergeRefs<HTMLDivElement>(
          refs.setFloating,
          floatingProps.ref as React.Ref<HTMLDivElement>,
          tooltipProps.ref,
        )}
        className={cx(
          cl['bk-tooltip-provider__tooltip'],
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
        {tooltipContent}
        {/*
        Fake arrow element for position tracking, the real arrow is drawn using `border-image`.
        Note: `floating-ui` has a `FloatingArrow` component using a positioned <svg> arrow, but this doesn't work if
        the tooltip has `overflow: hidden/scroll/auto` or `contain: paint` enabled.
        */}
        <span ref={arrowRef} hidden/>
      </Tooltip>
    );
  }, [
    isMounted,
    tooltipContent,
    activePlacement,
    arrow,
    floatingStyles,
    getFloatingProps,
    floatingProps.ref,
    refs.setFloating,
    size,
    //tooltipProps, // Changes on every render
  ]);
  
  // Note: memoize this, so that the anchor does not get rerendered every time the floating element position changes
  const anchorRendered = React.useMemo(() => {
    const renderPropArg: GetReferenceProps = (userProps?: undefined | React.HTMLProps<Element>) => {
      const userPropsRef: undefined | string | React.Ref<Element> = userProps?.ref ?? undefined;
      if (typeof userPropsRef === 'string') {
        // We can't merge refs if one of the refs is a string
        console.error(`Failed to render Tooltip, due to use of legacy string ref`);
        return (userProps ?? {}) as Record<string, unknown>;
      }
      
      const props = getReferenceProps(userProps);
      const ref = mergeRefs(userPropsRef, refs.setReference, props.ref);
      
      return {
        ...props,
        ['aria-describedby']: floatingProps.id,
        ref,
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
  }, [
    children,
    refs.setReference,
    floatingProps.id,
    getReferenceProps,
  ]);
  
  return (
    <>
      {/* NOTE: `portal` is used here to prevent CSS rules from the parent from being inherited into the Tooltip */}
      {createPortal(tooltipRendered, document.body)} 
      {anchorRendered}
    </>
  );
};
