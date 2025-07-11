/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Popper from 'react-popper';
import * as PopperJS from '@popperjs/core';

import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import './Tooltip.scss';


// Check if the given React component is stateless (i.e. a function, and one without `forwardRef`)
const isStateless = (Element: React.ReactElement) => {
  return typeof Element.type === 'function' && Element.type.prototype && !Element.type.prototype.render;
};

export type PopperOptions = Partial<PopperJS.Options> & {
  createPopper?: undefined | typeof PopperJS.createPopper;
};

export type TooltipProps = Omit<ComponentProps<'div'>, 'children' | 'content'> & {
  children: React.ReactNode | ((props: Record<string, unknown>) => React.ReactNode),
  content: React.ReactNode,
  placement?: undefined | PopperOptions['placement'],
  interactive?: undefined | boolean,
};
export const Tooltip = (props: TooltipProps) => {
  const {
    children,
    content,
    className = '',
    placement = 'top',
    interactive = false,
  } = props;
  
  const [isActive, setIsActive] = React.useState(false);
  
  const [referenceElement, setReferenceElement] = React.useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = React.useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = React.useState<HTMLElement | null>(null);
  const popper = Popper.usePopper(referenceElement, popperElement, {
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } },
      { name: 'preventOverflow', enabled: true },
      { name: 'flip', options: {} }, // Flip the placement if needed to keep the tooltip visible
    ],
    placement,
  });
  
  const close = React.useCallback(() => {
    setIsActive(false);
  }, []);
  
  React.useEffect(() => {
    if (interactive && isActive) {
      window.document.body.addEventListener('click', close);
    }
    return () => {
      if (interactive && isActive) {
        window.document.body.removeEventListener('click', close);
      }
    };
  }, [isActive, close, interactive]);
  
  const onActive = () => {
    setIsActive(true);
  };
  
  const onDeactivate = () => {
    if (!interactive) {
      setIsActive(false);
    }
  };
  
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsActive(false);
    }
  };
  
  const renderReference = () => {
    const decoratedProps = {
      ref: setReferenceElement,
      onMouseEnter: onActive,
      onMouseLeave: onDeactivate,
      onFocus: onActive,
      onBlur: onDeactivate,
      onKeyDown,
    };
    
    let updatedChildren: React.ReactNode;
    
    if (typeof children === 'function') {
      updatedChildren = children(decoratedProps);
    } else if (typeof children === 'string') {
      updatedChildren = <span {...decoratedProps}>{children}</span>;
    } else if (React.Children.only(children)) {
      const onlyChild = children as React.ReactElement;
      if (isStateless(onlyChild)) {
        // We need to set a ref on the trigger element, so that we can obtain a reference the DOM element.
        // This doesn't work for function components. Such a function component must use `forwardRef` instead.
        throw new TypeError('Invalid trigger, must be a class component, or use forwardRef.');
      }
      updatedChildren = React.cloneElement(onlyChild, decoratedProps);
    } else {
      throw new TypeError('Invalid trigger, expected single element or function');
    }
    return updatedChildren;
  };
  
  const renderTooltip = () => {
    if (!content) {
      return null;
    }
    
    return (
      <div
        role="tooltip" // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tooltip_role
        className={cx('bkl bkl-tooltip', className, { 'bkl-tooltip--interactive': interactive })}
        ref={setPopperElement}
        style={popper.styles.popper}
        {...popper.attributes.popper}
      >
        <div className={cx('bkl-tooltip__content')}>{content}</div>
        <div className="bkl-tooltip__arrow" ref={setArrowElement} style={popper.styles.arrow}/>
      </div>
    );
  };
  
  return (
    <>
      {renderReference()}
      {isActive && ReactDOM.createPortal(renderTooltip(), document.body)}
    </>
  );
};
