/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { type ClassNameArgument, classNames as cx } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Icon } from '../../graphics/Icon/Icon.tsx';

import cl from './Modal.module.scss';

export { cl as ModalClassNames };


type ModalHeaderProps = React.PropsWithChildren<{
  unstyled?: boolean;
  className?: ClassNameArgument;
}>;

/* Modal Header component */
const ModalHeader = ({ children, unstyled, className }: ModalHeaderProps) => (
  <header
    className={cx(
      {
        bk: true,
        [cl['bk-modal__header'] as string]: !unstyled,
      },
      className,
    )}
  >
    {children}
  </header>
);

type ModalContentProps = React.PropsWithChildren<{
  unstyled?: boolean;
  className?: ClassNameArgument;
}>;

/* Modal Content component */
const ModalContent = ({ children, unstyled, className }: ModalContentProps) => (
  <section
    className={cx(
      {
        bk: true,
        'body-text': true,
        [cl['bk-modal__content'] as string]: !unstyled,
      },
      className,
    )}
  >
    {children}
  </section>
);

type ModalFooterProps = React.PropsWithChildren<{
  unstyled?: boolean;
  className?: ClassNameArgument;
}>;

/* Modal Footer component */
const ModalFooter = ({ children, unstyled, className }: ModalFooterProps) => (
  <footer
    className={cx(
      {
        bk: true,
        [cl['bk-modal__footer'] as string]: !unstyled,
      },
      className,
    )}
  >
    {children}
  </footer>
);

type ModalProps = React.PropsWithChildren<{
  unstyled?: boolean;
  size?: 'small' | 'medium' | 'large' | 'x-large' | 'fullscreen';
  active: boolean;
  className?: ClassNameArgument;
  onClose: () => void;
  closeable?: boolean;
}>;

/**
 * Modal component.
 */
const Modal = ({
  children,
  unstyled,
  className,
  size = "medium",
  closeable = true,
  active,
  onClose,
}: ModalProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  // Sync the `active` flag with the DOM dialog
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }

    if (active && !dialog.open) {
      dialog.showModal();
    } else if (!active && dialog.open) {
      dialog.close();
    }
  }, [active]);

  // Sync the dialog close event with the `active` flag
  const handleCloseEvent = React.useCallback(
    (event: Event): void => {
      const dialog = dialogRef.current;
      if (dialog === null) {
        return;
      }

      if (active && event.target === dialog) {
        onClose();
      }
    },
    [active, onClose],
  );
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) {
      return;
    }

    dialog.addEventListener('close', handleCloseEvent);
    return () => {
      dialog.removeEventListener('close', handleCloseEvent);
    };
  }, [handleCloseEvent]);

  const close = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDialogClick = React.useCallback(
    (event: React.MouseEvent) => {
      const dialog = dialogRef.current;
      if (dialog !== null && event.target === dialog && closeable) {
        // Note: clicking the backdrop just results in an event where the target is the `<dialog>` element. In order to
        // distinguish between the backdrop and the modal content, we assume that the `<dialog>` is fully covered by
        // another element. In our case, `bk-modal__content` must cover the whole `<dialog>` otherwise this will not work.
        close();
      }
    },
    [close],
  );

  // prevent closing dialog with Esc key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') {
      return;
    }
    if (closeable) {
      e.preventDefault();
    }
  };
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeable]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <dialog
      ref={dialogRef}
      className={cx(
        {
          bk: true,
          [cl['bk-modal-small'] as string]: size === 'small',
          [cl['bk-modal-medium'] as string]: size === 'medium',
          [cl['bk-modal-large'] as string]: size === 'large',
          [cl['bk-modal-x-large'] as string]: size === 'x-large',
          [cl['bk-modal-fullscreen'] as string]: size === 'fullscreen',
          [cl['bk-modal'] as string]: !unstyled,
        },
        className,
      )}
      onClick={handleDialogClick}
    >
      {closeable && (
        <button
          type="button"
          className={cx(cl['bk-modal__close'])}
          onClick={close}
          onKeyUp={close}
        >
          <Icon icon="close-x" />
        </button>
      )}
      <div className={cx(cl['bk-modal__container'])}>
        {children}
      </div>
    </dialog>
  );
};

Modal.Content = ModalContent;
Modal.Header = ModalHeader;
Modal.Footer = ModalFooter;

export { Modal };
