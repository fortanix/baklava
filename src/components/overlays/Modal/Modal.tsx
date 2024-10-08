/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  classNames as cx,
  type ClassNameArgument,
} from "../../../util/componentUtil.ts";
import * as React from "react";

import { Icon } from "../../graphics/Icon/Icon.tsx";

import cl from "./Modal.module.scss";

export { cl as ModalClassNames };

/*
const useClickOutside = <E extends HTMLElement>(ref: React.RefObject<E>, callback: () => void) => {
  const handleEvent = React.useCallback((event: React.PointerEvent<E>) => {
    if (ref && ref.current) {
      if (ref.current.contains(event.target as Node)) {
        React.setState({ hasClickedOutside: false });
      } else {
        React.setState({ hasClickedOutside: true });
      }
    }
  }, [ref]);

  React.useEffect(() => {
    if (!window.PointerEvent) { return; }

    document.addEventListener('pointerdown', handleEvent);

    return () => {
      if (window.PointerEvent) {
        document.removeEventListener('pointerdown', handleEvent);
      } else {
        document.removeEventListener('mousedown', handleEvent);
        document.removeEventListener('touchstart', handleEvent);
      }
    }
  }, []);

  return [ref, hasClickedOutside];
};
*/

export type ModalHeaderProps = React.PropsWithChildren<{
  unstyled?: boolean,
  className?: ClassNameArgument,
}>;

/* Modal Header component */
export const ModalHeader = ({
  children,
  unstyled,
  className,
}: ModalHeaderProps) => (
  <header
    className={cx(
      {
        bk: true,
        [cl["bk-modal__header"] as string]: !unstyled,
      },
      className,
    )}
  >
    {children}
  </header>
);

export type ModalContentProps = React.PropsWithChildren<{
  unstyled?: boolean,
  className?: ClassNameArgument,
}>;

/* Modal Content component */
export const ModalContent = ({
  children,
  unstyled,
  className,
}: ModalContentProps) => (
  <section
    className={cx(
      {
        bk: true,
        'body-text': true,
        [cl["bk-modal__content"] as string]: !unstyled,
      },
      className,
    )}
  >
    {children}
  </section>
);

export type ModalProps = React.PropsWithChildren<{
  unstyled?: boolean,
  size?: "small" | "medium" | "large" | "x-large" | "fullscreen",
  active: boolean,
  className?: ClassNameArgument,
  onClose: () => void,
  closeable?: boolean,
}>;

/**
 * Modal component.
 */
export const Modal = ({
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

    dialog.addEventListener("close", handleCloseEvent);
    return () => {
      dialog.removeEventListener("close", handleCloseEvent);
    };
  }, [handleCloseEvent]);

  const close = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDialogClick = React.useCallback(
    (event: React.MouseEvent) => {
      const dialog = dialogRef.current;
      if (dialog !== null && event.target === dialog) {
        // Note: clicking the backdrop just results in an event where the target is the `<dialog>` element. In order to
        // distinguish between the backdrop and the modal content, we assume that the `<dialog>` is fully covered by
        // another element. In our case, `bk-modal__content` must cover the whole `<dialog>` otherwise this will not work.
        close();
      }
    },
    [close],
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <dialog
      ref={dialogRef}
      className={cx(
        {
          bk: true,
          [cl["bk-modal-small"] as string]: size === "small",
          [cl["bk-modal-medium"] as string]: size === "medium",
          [cl["bk-modal-large"] as string]: size === "large",
          [cl["bk-modal-x-large"] as string]: size === "x-large",
          [cl["bk-modal-fullscreen"] as string]: size === "fullscreen",
          [cl["bk-modal"] as string]: !unstyled,
        },
        className,
      )}
      onClick={handleDialogClick}
    >
      {closeable && (
        <button
          type="button"
          className={cx(cl["bk-modal__close"])}
          onClick={close}
          onKeyUp={close}
        >
          <Icon icon="close-x" />
        </button>
      )}
      <div className={cx(cl["bk-modal__container"])}>
        {children}
      </div>
    </dialog>
  );
};
