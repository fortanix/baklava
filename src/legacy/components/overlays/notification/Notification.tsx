
import * as React from 'react';

import { classNames as cx, ClassNameArgument } from '../../../util/component_util';

import { toast, ToastContainer, ToastContainerProps, ToastContent, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CloseButton from '../../internal/CloseButton';
import { BaklavaIcon } from '../../../components/icons/icon-pack-baklava/BaklavaIcon';
import { Tooltip } from '../tooltip/Tooltip';
import { Button } from '../../buttons/Button';

import './Notification.scss';

type NotificationContent = ToastContent;

type NotificationOptions = Omit<ToastOptions, 'bodyClassName'> & {
  className?: ClassNameArgument,
  bodyClassName?: ClassNameArgument,
  actions?: React.ReactElement,
  actionsInline?: React.ReactElement,
};

export { NotificationContent, NotificationOptions };

type CopyActionButton = {
  message: NotificationContent,
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
            <BaklavaIcon icon="copy" />
          </Button>
        </Tooltip>
      }
    </>
  );
};

type NotificationMessageProps = {
  message: NotificationContent,
  actions?: React.ReactElement,
  actionsInline?: React.ReactElement,
};

export const NotificationMessage = ({
  message,
  actions,
  actionsInline,
}: NotificationMessageProps): React.ReactElement => {
  if (!actions && !actionsInline) {
    return <>{message}</>;
  }
  
  return (
    <>
      <div className="bkl-notification__message">
        <p>{message}</p>
        {actionsInline &&
          <div className="bkl-notification__actions-inline">
            {actionsInline}
          </div>
        }
      </div>
      {actions &&
        <div className="bkl-notification__actions">
          {actions}
        </div>
      }
    </>
  );
};

const success = (message: NotificationContent, options: NotificationOptions = {}) => {
  const { className, bodyClassName, ...restOptions } = options;
  return toast.success(message, {
    autoClose: 5000,
    className: cx('bkl-notification--success', className),
    bodyClassName: cx('bkl-notification__body', bodyClassName),
    progressClassName: 'bkl-notification__progress-bar--success',
    ...restOptions,
  });
};

const info = (message: NotificationContent, options: NotificationOptions = {}) => {
  const { className, bodyClassName, actions, actionsInline, ...restOptions } = options;
  return toast.info(<NotificationMessage message={message} actions={actions} actionsInline={actionsInline} />, {
    autoClose: 5000,
    className: cx('bkl-notification--info', className),
    bodyClassName: cx('bkl-notification__body', bodyClassName),
    progressClassName: 'bkl-notification__progress-bar--info',
    ...restOptions,
  });
};

const error = (message: NotificationContent, options: NotificationOptions = {}) => {
  const { className, bodyClassName, actions, actionsInline, ...restOptions } = options;
  return toast.error(
    <NotificationMessage
      message={message}
      actions={actions || <CopyActionButton message={message} />}
      actionsInline={actionsInline}
    />, {
      autoClose: 5000,
      className: cx('bkl-notification--error', className),
      bodyClassName: cx('bkl-notification__body', bodyClassName),
      progressClassName: 'bkl-notification__progress-bar--error',
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

export type CloseToastButtonProps = {
  closeToast?: (() => void)
};

const CloseToastButton = ({ closeToast }: CloseToastButtonProps) => (
  <CloseButton dark onClose={closeToast} />
);

export type NotificationContainerProps = Omit<ToastContainerProps, 'className'> & {
  className?: ClassNameArgument,
  showProgressBar?: boolean,
};
export const NotificationContainer = (props: NotificationContainerProps) => {
  const {
    className = '',
    showProgressBar = false,
    ...rest
  } = props;
  
  return (
    <ToastContainer
      className={cx('bkl-notification', className)}
      hideProgressBar={!showProgressBar}
      closeButton={<CloseToastButton/>}
      {...rest}
    />
  );
};

export default NotificationContainer;
