
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
				<section className={cx(cl["bk-modal__content"], "body-text")}>
					{children}
				</section>
			</div>
		</dialog>
	);
};
