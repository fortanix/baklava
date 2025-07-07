/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import FocusTrap from 'focus-trap-react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import { Backdrop } from '../../internal/Backdrop.tsx';
import { CloseButton } from '../../internal/CloseButton.tsx';
import { Loader } from '../loader/Loader.tsx';
import { useScroller } from '../../util/Scroller.tsx';

import './Modal.scss';


export type ModalProps = Omit<ComponentProps<'div'>, 'children'> & {
  active: boolean,
  onClose: () => void,
  title?: undefined | string,
  children: React.ReactNode,
  actions?: undefined | React.ReactNode,
  small?: undefined | boolean,
  medium?: undefined | boolean,
  large?: undefined | boolean,
  slide?: undefined | boolean,
  themeDark?: undefined | boolean,
  hideFooter?: undefined | boolean,
  fixedWidth?: undefined | boolean,
  allowBackdropClose?: undefined | boolean,
  autoHeight?: undefined | boolean,
  isLoading?: undefined | boolean,
};
export const Modal = (props: ModalProps) => {
  const scrollerProps = useScroller();
  const backdropRef = React.useRef<HTMLDivElement>(null);
  
  const {
    active,
    onClose,
    title = '',
    children,
    className = '',
    actions = '',
    small = false,
    medium = false,
    large = false,
    slide = false,
    themeDark = false,
    hideFooter = false,
    fixedWidth = false,
    allowBackdropClose = true,
    autoHeight = false,
    isLoading = false,
  } = props;
  
  // Add a class to the body when modal is active to prevent body from scrolling
  React.useEffect(() => {
    if (active) {
      document.body.classList.add('bkl-modal--open');
    } else {
      document.body.classList.remove('bkl-modal--open');
    }
    
    return () => {
      document.body.classList.remove('bkl-modal--open');
    };
  }, [active]);
  
  const onBackdropClick = (event: React.MouseEvent) => {
    if (allowBackdropClose && backdropRef.current && event.target === backdropRef.current) {
      onClose();
    }
  };
  
  const handleModalKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };
  
  const renderModal = () => active && (
    <Backdrop
      ref={backdropRef}
      className={cx('bkl-modal-backdrop', {
        'bkl-modal-backdrop--slide-right': slide,
        'bkl-theme-dark': themeDark,
      })}
      active={active}
      // Note: use `onMouseDown`, rather than `onClick`/`onMouseUp`, to prevent the modal closing from accidental drag
      // or selection mouse events. For example, if a user selects text inside a modal and ends with the cursor outside.
      onMouseDown={onBackdropClick}
      scrollable={autoHeight}
    >
      <FocusTrap
        // NOTE: due to test failure, add 'displayCheck' option
        // https://github.com/focus-trap/focus-trap-react?tab=readme-ov-file#testing-in-jsdom
        focusTrapOptions={{
          tabbableOptions: {
            displayCheck: 'none',
          },
          allowOutsideClick: true,
          // Receives focus if no other tabbable element found
          fallbackFocus: <div tabIndex={-1} />,
        }}
      >
        {/** biome-ignore lint/a11y/noStaticElementInteractions: Key handler is an optional affordance. */}
        <div
          className={cx('bkl-modal', className, {
            'bkl-modal--active': active,
            'bkl-modal--small': small,
            'bkl-modal--medium': medium,
            'bkl-modal--large': large,
            'bkl-modal--slide': slide,
            'bkl-modal--fixed-width': fixedWidth,
            'bkl-modal--footer-hidden': hideFooter || !actions,
            'bkl-modal--auto-height': autoHeight,
          })}
          onKeyDown={handleModalKeyDown}
        >
          <h4 className="bkl-modal__header">
            <span className="bkl-modal__title">{title}</span>
            <CloseButton className="bkl-modal__close" onClose={onClose}/>
          </h4>
          {isLoading ?
            <div className="bkl-modal__loader">
              <Loader delay={0}/>
            </div>
          :
            <>
              <div className={cx('bkl-modal__content', scrollerProps.className)}>
                {children}
              </div>
              <div className="bkl-modal__footer">
                {actions}
              </div>
            </>
          }
        </div>
      </FocusTrap>
    </Backdrop>
  );
  
  return ReactDOM.createPortal(renderModal(), document.body);
};
