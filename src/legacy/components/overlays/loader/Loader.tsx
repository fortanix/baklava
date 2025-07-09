/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { classNames as cx, ClassNameArgument } from '../../../util/component_util';

import Backdrop from '../../internal/Backdrop';

import './Loader.scss';


export const LoaderIcon = () => {
  return (
    <div className="bkl-loader">
      <div className="bkl-loader__spinner"/>
    </div>
  );
};

type LoaderProps = Omit<JSX.IntrinsicElements['div'], 'className'> & {
  className?: ClassNameArgument,
  withBackdrop?: boolean,
  delay?: number,
};
export const Loader = (props: LoaderProps) => {
  const {
    className = '',
    withBackdrop = false,
    delay = 1000,
  } = props;
  
  const [isTimeoutActive, setIsTimeoutActive] = React.useState(true);
  
  React.useEffect(() => {
    let timeout: number | undefined;
    if (typeof window === 'undefined') {
      setIsTimeoutActive(false);
    } else {
      timeout = window.setTimeout(() => {
        setIsTimeoutActive(false);
      }, delay);
    }
    return () => {
      if (typeof window !== 'undefined' && timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, []);
  
  const renderLoaderWithBackdrop = () => (
    <Backdrop
      active
      className={cx('bkl-loader-overlay', className)}
    >
      <LoaderIcon/>
    </Backdrop>
  );
  
  const renderLoader = () => (
    <>
      {withBackdrop
        ? ReactDOM.createPortal(renderLoaderWithBackdrop(), document.body)
        : <LoaderIcon/>
      }
    </>
  );
  
  return isTimeoutActive ? null : renderLoader();
};
