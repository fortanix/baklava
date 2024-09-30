/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
|* distributed with this file, you can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { classNames as cx, type ClassNameArgument } from '../../../util/componentUtil.ts';

import {
  toast,
  ToastContainer as ToastifyContainer,
  type ToastContainerProps as ToastifyContainerProps,
  type ToastContent,
  type ToastOptions as ToastifyOptions,
} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Icon } from '../../graphics/Icon/Icon.tsx';
//import CloseButton from '../../internal/CloseButton';
import { TooltipProvider } from '../Tooltip/TooltipProvider.tsx';

import './Toast.css';


export { type ToastContent };

export type ToastOptions = Omit<ToastifyOptions, 'bodyClassName'> & {
  className?: ClassNameArgument,
  bodyClassName?: ClassNameArgument,
  actions?: React.ReactElement,
  actionsInline?: React.ReactElement,
};

export type CopyActionButton = {
  message: ToastContent,
  className?: string,
};
export const CopyActionButton = ({ message, className }: CopyActionButton): React.ReactElement => {
  const defaultTooltipMessage = 'Copy message';
  const [tooltipMessage, setTooltipMessage] = React.useState(defaultTooltipMessage);
  
  const isStringMessage = typeof message === 'string';
  
  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isStringMessage) {
      try {
        await navigator.clipboard.writeText(message);
        setTooltipMessage('Successfully copied');
        setTimeout(() => {
          setTooltipMessage(defaultTooltipMessage);
        }, 2000);
      } catch (error: unknown) {
        setTooltipMessage('Failed to copy');
        setTimeout(() => {
          setTooltipMessage(defaultTooltipMessage);
        }, 2000);
      }
    }
  };
  
  return (
    <>
      {isStringMessage &&
        <TooltipProvider placement="top" tooltip={tooltipMessage} className="bk-toast__tooltip">
          <Icon
            icon="copy"
            className={cx('bk-toast__copy-icon', className)}
            onClick={handleCopy}
          />
        </TooltipProvider>
      }
    </>
  );
};

type ToastMessageProps = {
  message: ToastContent,
  actions?: React.ReactElement,
  actionsInline?: React.ReactElement,
};
export const ToastMessage = (props: ToastMessageProps): React.ReactElement => {
  const {
    message,
    actions,
    actionsInline,
  } = props;
  
  if (!actions && !actionsInline) {
    return <>{message}</>;
  }
  
  return (
    <>
      <div className="bk-toast__message">
        <p>{typeof message === 'function' ? null : message}</p>
        {actionsInline &&
          <div className="bk-toast__actions-inline">
            {actionsInline}
          </div>
        }
      </div>
      {actions &&
        <div className="bk-toast__actions">
          {actions}
        </div>
      }
    </>
  );
};

const success = (message: ToastContent, options: ToastOptions = {}) => {
  const { className, bodyClassName, ...restOptions } = options;
  return toast.success(message, {
    autoClose: 5000,
    className: cx('bk-toast--success', className),
    bodyClassName: cx('bk-toast__body', bodyClassName),
    progressClassName: 'bk-toast__progress-bar--success',
    ...restOptions,
  });
};

const info = (message: ToastContent, options: ToastOptions = {}) => {
  const { className, bodyClassName, actions, actionsInline, ...restOptions } = options;
  return toast.info(<ToastMessage message={message} actions={actions} actionsInline={actionsInline} />, {
    autoClose: 5000,
    className: cx('bk-toast--info', className),
    bodyClassName: cx('bk-toast__body', bodyClassName),
    progressClassName: 'bk-toast__progress-bar--info',
    ...restOptions,
  });
};

const error = (message: ToastContent, options: ToastOptions = {}) => {
  const { className, bodyClassName, actions, actionsInline, ...restOptions } = options;
  return toast.error(
    <ToastMessage
      message={message}
      actions={actions || <CopyActionButton message={message} />}
      actionsInline={actionsInline}
    />, {
      autoClose: 5000,
      className: cx('bk-toast--error', className),
      bodyClassName: cx('bk-toast__body', bodyClassName),
      progressClassName: 'bk-toast__progress-bar--error',
      ...restOptions,
    });
};

const dismiss = (id?: string | number): boolean | void => toast.dismiss(id);

export const notify = {
  success,
  info,
  error,
  dismiss,
};

type CloseToastButtonProps = {
  closeToast?: () => void,
};
const CloseToastButton = ({ closeToast }: CloseToastButtonProps) => (
  <Icon icon="cross" className="bk-close--dark" onClick={closeToast} />
);

export type ToastContainerProps = Omit<ToastifyContainerProps, 'className'> & {
  className?: ClassNameArgument,
  showProgressBar?: boolean,
};
export const ToastContainer = (props: ToastContainerProps) => {
  const {
    className = '',
    showProgressBar = false,
    ...propsRest
  } = props;
  
  return (
    <ToastifyContainer
      className={cx('bk-toast', className)}
      hideProgressBar={!showProgressBar}
      closeButton={<CloseToastButton/>}
      {...propsRest}
    />
  );
};
