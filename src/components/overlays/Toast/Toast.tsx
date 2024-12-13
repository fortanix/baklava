/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

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
import { TooltipProvider } from '../Tooltip/TooltipProvider.tsx';
import { Button, type ButtonProps } from '../../actions/Button/Button.tsx';
import { Link, type LinkProps } from '../../actions/Link/Link.tsx';

import './ToastyOverride.scss';
import cl from './Toast.module.scss';

export { cl as ToastClassNames };

export type { ToastContent };


export const ToastLink = ({ className, ...propsRest }: LinkProps) => {
  return (
    <Link className={cx(cl['bk-toast__link'], className)} {...propsRest} />
  );
};

export const ToastButton = ({ className, ...propsRest }: ButtonProps) => {
  return (
    <Button className={cx(cl['bk-toast__button'], className)} {...propsRest} />
  );
};

export type CopyActionButton = {
  /** A tooltip message of this component. */
  message: ToastContent,
  
  /** A classname of this component. */
  className?: ClassNameArgument,
};
export const CopyActionButton = ({ message = null, className }: CopyActionButton): React.ReactElement | null => {
  const defaultTooltipMessage = 'Copy message';
  const [tooltipMessage, setTooltipMessage] = React.useState<string>(defaultTooltipMessage);
  const isStringMessage = typeof message === 'string';
  
  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isStringMessage) {
      try {
        await navigator.clipboard.writeText(message);
        setTooltipMessage('Successfully copied');
      } catch (error: unknown) {
        setTooltipMessage('Failed to copy');
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
        <TooltipProvider placement="bottom" tooltip={tooltipMessage} className="bk-toast__tooltip">
          <Button
            className={cx(cl['bk-toast__copy-button'], className)}
            onClick={handleCopy}
          >
            Copy
          </Button>
        </TooltipProvider>
      }
    </>
  );
};

export const ToastMessage = (props: NotifyProps): React.ReactElement => {
  const { title, message, options = {} } = props;
  
  return (
    <>
      <div className={cx(cl['bk-toast__message'])}>
        <div className={cx(cl['bk-toast__message__title'])}>
          {title}
        </div>
        {(message && typeof message !== 'function') && <p>{message}</p>}
      </div>
      {options.actions &&
        <div className={cx(cl['bk-toast__actions'])}>
          {options.actions}
        </div>
      }
    </>
  );
};

type ToastOptions = Omit<ToastifyOptions, 'bodyClassName'> & {
  className?: ClassNameArgument,
  bodyClassName?: ClassNameArgument,
  actions?: React.ReactElement,
};
export type NotifyProps = {
  /** A title of this component. */
  title: string | React.ReactNode,
  
  /** A message of this component. */
  message?: ToastContent,
  
  /** Options of this component. */
  options?: ToastOptions,
}
const success = ({ title, message, options = {} }: NotifyProps) => {
  const { className, bodyClassName, actions, closeButton = false, ...restOptions } = options;
  const content = <ToastMessage title={title} message={message} options={options} />;
  const updatedOptions: ToastifyOptions = {
    autoClose: 5000,
    className: cx(cl['bk-toast--success'], className),
    bodyClassName: cx(cl['bk-toast__body'], bodyClassName),
    progressClassName: cx(cl['bk-toast__progress-bar--success']),
    icon: <Icon icon="status-success" className={cx(cl['bk-toast__icon--success'])} />,
    closeButton: closeButton === true ? <CloseToastButton /> : closeButton,
    ...restOptions,
  };
  return toast.success(content, updatedOptions);
};

const info = ({ title, message, options = {} }: NotifyProps) => {
  const { className, bodyClassName, actions, closeButton = false, ...restOptions } = options;
  const content = <ToastMessage title={title} message={message} options={options} />;
  const updatedOptions: ToastifyOptions = {
    autoClose: 5000,
    className: cx(cl['bk-toast--info'], className),
    bodyClassName: cx(cl['bk-toast__body'], bodyClassName),
    progressClassName: cx(cl['bk-toast__progress-bar--info']),
    icon: <Icon icon="warning" className={cx(cl['bk-toast__icon--info'])} />,
    closeButton: closeButton === true ? <CloseToastButton /> : closeButton,
    ...restOptions,
  };
  return toast.info(content, updatedOptions);
};

const error = ({ title, message, options = {} }: NotifyProps) => {
  const { className, bodyClassName, actions, closeButton = false, ...restOptions } = options;
  const content = (
    <ToastMessage
      title={title}
      message={message}
      options={{
        ...options,
        ...(actions || message) && { actions: actions || <CopyActionButton message={message} /> },
      }}
    />
  );
  const updatedOptions: ToastifyOptions = {
    autoClose: 5000,
    className: cx(cl['bk-toast--error'], className),
    bodyClassName: cx(cl['bk-toast__body'], bodyClassName),
    progressClassName: cx(cl['bk-toast__progress-bar--error']),
    icon: <Icon icon="status-failed" className={cx(cl['bk-toast__icon--error'])} />,
    closeButton: closeButton === true ? <CloseToastButton /> : closeButton,
    ...restOptions,
  };
  return toast.error(content, updatedOptions);
};

const dismiss = (id?: string | number): void => toast.dismiss(id);

export const notify = { success, info, error, dismiss };

type CloseToastButtonProps = {
  closeToast?: () => void,
};
const CloseToastButton = ({ closeToast }: CloseToastButtonProps) => (
  <Icon icon="cross" className={cx(cl['bk-toast__action-close'])} onClick={closeToast} />
);

type ToastProviderProps = Omit<ToastifyContainerProps, 'className'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A classname of this component. */
  className?: ClassNameArgument,
  
  /** Whether this component should have a close button. */
  hasCloseButton?: boolean,
  
  /** Whether this component should display progress bar. */
  showProgressBar?: boolean,
  
  /** Components or elements to be rendered within the Provider. */
  children: React.ReactNode,
};
export const ToastProvider = (props: ToastProviderProps) => {
  const {
    unstyled = false,
    hasCloseButton = false,
    className = '',
    showProgressBar = false,
    children,
    ...propsRest
  } = props;
  
  return (
    <>
      {children}
      {ReactDOM.createPortal(
        <ToastifyContainer
          className={cx(
            {
              bk: true,
              [cl['bk-toast']]: !unstyled,
            },
            className,
          )}
          hideProgressBar={!showProgressBar}
          closeButton={hasCloseButton && <CloseToastButton/>}
          {...propsRest}
        />,
        window.document.body,
      )}
    </>
  );
};
