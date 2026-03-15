/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';

import { TextArea, type TextAreaProps } from '../TextArea/TextArea.tsx';
import { InputFile, readFile } from '../InputFile/InputFile.tsx';

import { classNames as cx } from '../../../../util/componentUtil.ts';

import cl from './TextAreaWithFileUpload.module.scss';

export type TextAreaWithFileUploadProps = TextAreaProps & {
  /**
   * Comma separated file extension (e.g. `.txt`), mime type (`application/pdf`) or media (`image/*`, `audio/*` or
   * `video/*`) that are allowed to be selected.
   * Notice that .webp files are not considered as `image/*`, at least in Chromium v144
   * */
  accept?: undefined | HTMLInputElement['accept'],
};

export const TextAreaWithFileUpload = ({
  value,
  onChange,
  accept,
  unstyled,
  disabled,
  invalid,
  ...textAreaProps
}: TextAreaWithFileUploadProps) => {

  const dragCounter = React.useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const updateTextArea = (text: string) => {
    if (!onChange) return;

    const event = {
      target: { value: text }
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(event);
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    readFile(file, (result) => {
      const text = typeof result === 'string' ? result : '';
      updateTextArea(text);
    });
  };

  const onDragIn = (e: React.DragEvent) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const onDragOut = (e: React.DragEvent) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const onDrag = (e: React.DragEvent) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: React.DragEvent) => {
    if (disabled) return;

    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
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
        },
        textAreaProps.className,
      )}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: keyboard users can use the button to upload */}
      <div
        className={cl['bk-text-area-upload__textarea-wrapper']}
        onDragEnter={onDragIn}
        onDragLeave={onDragOut}
        onDragOver={onDrag}
        onDrop={onDrop}
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
          invalid={invalid}
        />

        <div className={cx(cl['bk-text-area-upload__footer'],
          {
            [cl['bk-text-area-upload__footer--disabled']]: disabled,
            [cl['bk-text-area-upload__footer--invalid']]: invalid,
          }
        )}>
          <span>Drop file or </span>

          <InputFile
            accept={accept}
            handleFiles={handleFiles}
            disabled={disabled}
            unstyled={unstyled}
            className={cl['bk-text-area-upload__browse']}
            inputProps={{ className: cl['bk-text-area-upload__input'] }}
          />
        </div>
      </div>

      {isDragging && (
        <div className={cx({
          [cl['bk-text-area-upload__overlay']]: !unstyled,
        })}>
          Drop file here
        </div>
      )}
    </div>
  );
};
