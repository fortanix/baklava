
import * as React from 'react';
import { mergeCallbacks, mergeRefs } from '../../../../util/reactUtil.ts';

import {
  type FocusChangeEvent,
  type OpenChangeEvent,
  type OpenStateProps,
  type UseFloatingElementOptions,
  type UseFloatingElementResult,
  useFloatingElement,
} from '../floating-ui/useFloatingElement.tsx';


export type { FocusChangeEvent, OpenChangeEvent, OpenStateProps };

export type UseFloatingMenuOptions = UseFloatingElementOptions;
export type UseFloatingMenuResult = UseFloatingElementResult;

/** Utility wrapper for `useFloatingElement`, specialized for menus. */
export const useFloatingMenu = (options: UseFloatingElementOptions): UseFloatingElementResult => {
  return useFloatingElement({
    ...options,
    popoverBehavior: options.popoverBehavior ?? 'manual',
    triggerAction: options.triggerAction ?? 'combobox',
    offset: options.offset ?? 8,
    placement: options.placement ?? 'bottom-start',
    floatingUiFlipOptions: {
      ...options.floatingUiFlipOptions,
      fallbackAxisSideDirection: options.floatingUiFlipOptions?.fallbackAxisSideDirection ?? 'none',
      fallbackStrategy: options.floatingUiFlipOptions?.fallbackStrategy ?? 'initialPlacement',
    },
  });
};


export type BaseAnchorRenderArgs = {
  props: (userProps?: undefined | React.HTMLProps<Element>) => Record<string, unknown>,
  open: boolean,
  requestOpen: () => void,
  close: () => void,
};
export type UseMenuAnchorOptions<RenderArgs> = {
  children?: undefined | React.ReactNode | ((args: RenderArgs) => React.ReactNode),
  isOpen: boolean,
  requestOpenChange: (event: OpenChangeEvent) => void,
  menuId: string,
  getReferenceProps: UseFloatingMenuResult['getReferenceProps'],
  refs: UseFloatingMenuResult['refs'],
  getRenderArgs: (args: BaseAnchorRenderArgs) => RenderArgs,
};
export const useMenuAnchor = <RenderArgs extends BaseAnchorRenderArgs>(options: UseMenuAnchorOptions<RenderArgs>) => {
  const {
    children,
    isOpen,
    requestOpenChange,
    menuId,
    getReferenceProps,
    refs,
    getRenderArgs,
  } = options;
  
  // Note: memoize this, so that the anchor does not get rerendered every time the floating element position changes
  const anchor = React.useMemo(() => {
    // FIXME: make `React.HTMLProps<Element>` generic, since not all component props extend from this type
    const anchorProps = (userProps?: undefined | React.HTMLProps<Element>) => {
      const userPropsRef = userProps?.ref;
      
      if (typeof userPropsRef === 'string') {
        console.error('Failed to render MenuProvider, due to use of legacy string ref');
        return userProps as Record<string, unknown>;
      }
      
      const props = getReferenceProps(userProps);
      const ref = mergeRefs(
        userPropsRef,
        refs.setReference,
        props.ref as React.Ref<Element>,
      );
      
      return {
        ...props,
        ref,
        'aria-controls': menuId,
        'aria-haspopup': 'listbox',
        'aria-expanded': isOpen,
        // biome-ignore lint/suspicious/noExplicitAny: `onBlur` should be a function here
        onBlur: mergeCallbacks([userProps?.onBlur, props.onBlur as any]),
      };
    };
    
    if (typeof children === 'function') {
      const baseArgs: BaseAnchorRenderArgs = {
        props: anchorProps,
        open: isOpen,
        requestOpen: () => { requestOpenChange({ open: true }); },
        close: () => { requestOpenChange({ open: false }); },
      };
      
      return children(getRenderArgs(baseArgs));
    }
    
    // If no `children` are defined, the consumer may be using an imperative handler rather than an anchor.
    // Do not render any anchor in this case.
    if (!children) { return null; }
    
    if (!React.isValidElement(children)) {
      // Edge case: if `children` is defined but not a valid element, then wrap it in an element ourselves.
      // NOTE: must be an interactive element, like a `<button>`, in order for this to be valid in terms of ARIA.
      return <button {...anchorProps()}>{children}</button>;
    }
    
    // If a single element is given, apply the anchor props on that element. Note: the consumer must ensure
    // that this element is a valid interactive element, like a `<button>`.
    // NOTE: `cloneElement` is marked as a legacy function by React. Recommended is to use a render prop instead.
    return React.cloneElement(children, anchorProps(children.props as React.HTMLProps<Element>));
  }, [
    children,
    getReferenceProps,
    isOpen,
    menuId,
    refs.setReference,
    requestOpenChange,
    getRenderArgs,
  ]);
  
  return { anchor };
};
