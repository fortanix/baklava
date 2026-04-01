/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { TextArea } from '../TextArea/TextArea.tsx';
import { handleWrongFileFormat, InputFile, isFileAccepted, readFile } from '../InputFile/InputFile.tsx';
import { Button } from '../../../actions/Button/Button.tsx';
import { H6 } from '../../../../typography/Heading/Heading.tsx';
import { notify } from '../../../overlays/ToastProvider/ToastProvider.tsx';

import { classNames as cx } from '../../../../util/componentUtil.ts';

import cl from './TextAreaWithFileUpload.module.scss';

export type TextAreaWithFileUploadProps = React.ComponentProps<typeof TextArea> & {
  /**
   * Comma separated file extension (e.g. `.txt`), mime type (`application/pdf`) or media (`image/*`, `audio/*` or
   * `video/*`) that are allowed to be selected.
   * Notice that .webp files are not considered as `image/*`, at least in Chromium v144
   */
  accept?: undefined | HTMLInputElement['accept'],
  /**
   * Enables drag-and-drop file upload on the textarea.
   *
   * - When `true`: users can drag and drop files into the textarea.
   * - When `false` or `undefined`: drag-and-drop is disabled.
   *
   * Note:
   * - File selection via the `Upload` button is still available regardless of this value.
   * - Drag overlay and drag event listeners are only active when enabled.
   *
   * @default false.
   */
  enableDragAndDrop?: undefined | boolean;

  /**
   * Maximum allowed file size in megabytes (MB).
   *
   * Example:
   * - 1 → 1 MB
   * - 5 → 5 MB
   *
   * If not provided, no file size limit is enforced.
   */
  maxSize?: undefined | number;
};

const formatAcceptText = (accept?: string) => {
  if (!accept) return '';

  const parts = accept.split(',').map(p => p.trim()).filter(Boolean);

  if (parts.length <= 1) return parts[0] || '';

  return parts.slice(0, -1).join(', ') + ' or ' + parts.at(-1);
};

const isFileValid = (file: File, accept?: string, maxSize?: number) => {
  const isValidType = isFileAccepted(file, accept);

  const isValidSize =
    !maxSize || file.size <= maxSize * 1024 * 1024;

  return {
    isValid: isValidType && isValidSize,
    isValidType,
    isValidSize,
  };
};
export const TextAreaWithFileUpload = ({
  value,
  onChange,
  accept,
  unstyled,
  disabled,
  enableDragAndDrop = false,
  maxSize,
  ...textAreaProps
}: TextAreaWithFileUploadProps) => {
  // Track nested dragenter / dragleave events.
  // Browsers fire these events for every child element the cursor moves over.
  // Without a counter, moving between children would trigger a dragleave on the
  // parent and cause the "dragging" state to flicker. We increment on dragenter
  // and decrement on dragleave, and only reset the dragging state when the
  // counter reaches 0 (meaning the cursor actually left the component).

  /*
  References:
  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dragenter_event
  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dragleave_event
  - https://stackoverflow.com/questions/7110353/html5-dragleave-fired-when-hovering-a-child-element
  */

  const dragCounter = React.useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const formattedAccept = formatAcceptText(accept);
  const isTextEmpty = !(value && String(value).trim());

  const updateTextArea = (text: string) => {
    if (!onChange) { return };

    const event = {
      target: { value: text }
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(event);
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) { return };

    const { isValid, isValidSize } =
      isFileValid(file, accept, maxSize);

    if (!isValid) {
      if (!isValidSize) {
        notify.error(
          `The file ${file.name} exceeds the maximum size of ${maxSize} MB.`
        );
      }

      return;
    }

    readFile(file, (result) => {
      const text = typeof result === 'string' ? result : '';
      updateTextArea(text);
    });
  };

  const onDragIn = (e: React.DragEvent) => {
    if (disabled || !enableDragAndDrop) { return; }

    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const onDragOut = (e: React.DragEvent) => {
    if (disabled || !enableDragAndDrop) { return; }

    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    if (disabled || !enableDragAndDrop) { return; }

    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    if (disabled || !enableDragAndDrop) { return; }

    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(file => isFileAccepted(file, accept));

      if (accept) {
        const invalidFiles = Array.from(e.dataTransfer.files).filter(file => !isFileAccepted(file, accept));
        invalidFiles.forEach(file => handleWrongFileFormat(file.name, accept));
      }

      if (validFiles.length > 0) {
        handleFiles(validFiles as unknown as FileList);
      }

      e.dataTransfer.clearData();
    }

    dragCounter.current = 0;
  };

  return (
    <div
      className={cx(
        'bk',
        {
          [cl['bk-text-area-upload']]: !unstyled,
          [cl['bk-text-area-upload--dragging']]: isDragging,
          [cl['bk-text-area-upload--disabled']]: disabled,
        },
        textAreaProps.className,
      )}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: keyboard users can use the button to upload */}
      <div
        className={cx(cl['bk-text-area-upload__textarea-wrapper'],
          {
            [cl['bk-text-area-upload__textarea-wrapper--disabled']]: disabled,
          }
        )}
        onDragEnter={enableDragAndDrop ? onDragIn : undefined}
        onDragLeave={enableDragAndDrop ? onDragOut : undefined}
        onDragOver={enableDragAndDrop ? onDrag : undefined}
        onDrop={enableDragAndDrop ? onDrop : undefined}
      >
        <TextArea
          {...textAreaProps}
          className={cx(
            cl['bk-text-area-upload__textarea'],
            textAreaProps.className
          )}
          unstyled={unstyled}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
        <hr />
        <div className={cl['bk-text-area-upload__footer']}>

          <InputFile
            accept={accept}
            handleFiles={handleFiles}
            disabled={disabled || !isTextEmpty}
            unstyled={unstyled}
            label="Upload File"
            className={cl['bk-text-area-upload__browse']}
            inputProps={{ className: cl['bk-text-area-upload__input'] }}
          />
          {!isTextEmpty &&
            <>
              <hr />
              <Button
                className={cl['bk-text-area-upload__clear']}
                label='Clear'
                onPress={() => {
                  updateTextArea('')
                }}
              />
            </>
          }
        </div>
      </div>

      {enableDragAndDrop && isDragging && (
        <div
          className={cx(
            cl['bk-text-area-upload__overlay'],
            {
              [cl['bk-text-area-upload__overlay--disabled']]: disabled,
            }
          )}
        >
          <div className={cl['bk-text-area-upload__overlay-content']}>
            <H6 className={cl['bk-text-area-upload__overlay-title']}>
              Drag & drop files
            </H6>

            {formattedAccept && (
              <span className={cl['bk-text-area-upload__overlay-info']}>
                Only {formattedAccept} file.
                {maxSize && <> {maxSize}MB max file size</>}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
