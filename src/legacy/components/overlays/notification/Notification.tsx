/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ClassNameArgument } from '../../../util/component_util.tsx';

import { 
  type ToastContainerProps,
  type ToastContent,
  type ToastOptions,
  ToastContainer,
  toast,
} from 'react-toastify';

import { BaklavaIcon } from '../../../components/icons/icon-pack-baklava/BaklavaIcon.tsx';
import { Tooltip } from '../tooltip/Tooltip.tsx';
import { Button } from '../../buttons/Button.tsx';

import './Notification.scss';


type NotificationContent = ToastContent;

type NotificationOptions = ToastOptions & {
  className?: undefined | ClassNameArgument,
  actions?: undefined | React.ReactElement,
  actionsInline?: undefined | React.ReactElement,
};

export type { NotificationContent, NotificationOptions };

type CopyActionButton = {
  message: NotificationContent,
  className?: undefined | ClassNameArgument,
};
export const CopyActionButton = ({ message, className }: CopyActionButton) => {
  const defaultTooltipMessage = 'Copy message';
  const [tooltipMessage, setTooltipMessage] = React.useState(defaultTooltipMessage);
  
  const isStringMessage = typeof message === 'string';
  
  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isStringMessage) {
      try {
        await navigator.clipboard.writeText(message);
        setTooltipMessage('Copied to clipboard');
      } catch (error: unknown) {
        setTooltipMessage('Failed to copy to clipboard');
      } finally {
        setTimeout(() => {
          setTooltipMessage(defaultTooltipMessage);
        }, 2000);
      }
    }
  };
  
  return (
    <>
      {isStringMessage &&
        <Tooltip placement="top" content={tooltipMessage} className="bkl-notification__tooltip">
          <Button plain className={cx('bkl-notification__copy-button', className)} onClick={handleCopy}>
            <BaklavaIcon icon="copy"/>
          </Button>
        </Tooltip>
      }
    </>
  );
};

type NotificationMessageProps = {
  message: NotificationContent,
  actions?: undefined | React.ReactElement,
  actionsInline?: undefined | React.ReactElement,
};
export const NotificationMessage = ({
  message,
  actions,
  actionsInline,
}: NotificationMessageProps) => {
  if (!actions && !actionsInline) {
    return <>{message}</>;
  }
  
  return (
    <>
      <div className="bkl-notification__message">
        {/* FIXME: according to the type, `message` can be a function, how should we handle this? */}
        <p>{typeof message === 'function' ? '' : message}</p>
      </div>
      {actionsInline &&
        <div className="bkl-notification__actions-inline">
          {actionsInline}
        </div>
      }
      {actions &&
        <div className="bkl-notification__actions">
          {actions}
        </div>
      }
    </>
  );
};

const success = (message: NotificationContent, options: NotificationOptions = {}) => {
  const { className, ...restOptions } = options;
  return toast.success(message, {
    autoClose: 5000,
    className: cx('bkl bkl-notification bkl-notification--success', className),
    progressClassName: 'bkl-notification__progress-bar',
    ...restOptions,
  });
};

const info = (message: NotificationContent, options: NotificationOptions = {}) => {
  const { className, actions, actionsInline, ...restOptions } = options;
  return toast.info(<NotificationMessage message={message} actions={actions} actionsInline={actionsInline}/>, {
    autoClose: 5000,
    className: cx('bkl bkl-notification bkl-notification--info', className),
    progressClassName: 'bkl-notification__progress-bar',
    ...restOptions,
  });
};

const error = (message: NotificationContent, options: NotificationOptions = {}) => {
  const { className, actions, actionsInline, ...restOptions } = options;
  return toast.error(
    <NotificationMessage
      message={message}
      actions={actions || <CopyActionButton message={message} />}
      actionsInline={actionsInline}
    />, {
      autoClose: 5000,
      className: cx('bkl bkl-notification bkl-notification--error', className),
      progressClassName: 'bkl-notification__progress-bar--error',
      ...restOptions,
    });
};

const dismiss = (id?: string | number): void => toast.dismiss(id);

export const notify = {
  success,
  info,
  error,
  dismiss,
};

export type NotificationContainerProps = Omit<ToastContainerProps, 'className'> & {
  className?: undefined | ClassNameArgument,
  showProgressBar?: undefined | boolean,
};
export const NotificationContainer = (props: NotificationContainerProps) => {
  const {
    className,
    showProgressBar = true,
    ...rest
  } = props;
  
  return (
    <ToastContainer
      className={cx('bkl bkl-notification-container', className)}
      hideProgressBar={!showProgressBar}
      {...rest}
    />
  );
};
