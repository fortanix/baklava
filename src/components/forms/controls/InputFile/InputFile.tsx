/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../../util/componentUtil.ts';

import { Button } from '../../../actions/Button/Button.tsx';

import cl from './InputFile.module.scss';


export { cl as InputFileClassNames };

export const readFile = (
  file: File,
  handleFile: (result: string | ArrayBuffer | null, file: File, error?: undefined | unknown) => void,
  readAsArrayBuffer?: boolean,
  encoding = 'UTF-8',
) => {
  let result: string | ArrayBuffer | null = '';

  try {
    const fileReader = new FileReader();
    if (!readAsArrayBuffer) {
      fileReader.readAsText(file, encoding);
    } else {
      fileReader.readAsArrayBuffer(file);
    }
    fileReader.onloadend = () => {
      result = fileReader.result;
      handleFile(result, file);
    };
  } catch (e: unknown) {
    console.error(e);
    handleFile(result, file, e);
  }
};

const isFileAccepted = (file: File, accept?: string) => {
  if (!accept) return true;

  const acceptList = accept.split(',').map(type => type.trim());

  return acceptList.some(acceptedType => {
    if (acceptedType.startsWith('.')) {
      return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
    }
    if (acceptedType.endsWith('/*')) {
      const baseType = acceptedType.replace('/*', '');
      return file.type.startsWith(baseType);
    }
    return file.type === acceptedType;
  });
};

export type InputFileProps = React.ComponentPropsWithoutRef<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** Props to apply to the container element. */
  containerProps?: React.ComponentProps<'div'>,

  /** Props to apply to the inner `<input/>` element. */
  inputProps?: React.ComponentProps<'input'>,

  /** Whether to show an area to accept dragged files into. */
  dragAndDrop?: undefined | boolean,

  /** A function to pass the files to be handled after selection. */
  handleFiles?: undefined | ((files: FileList) => void),

  /**
   * Comma separated file extension (e.g. `.txt`), mime type (`application/pdf`) or media (`image/*`, `audio/*` or
   * `video/*`) that are allowed to be selected.
   * Notice that .webp files are not considered as `image/*`, at least in Chromium v144
   * */
  accept?: undefined | HTMLInputElement['accept'],
  
  /**
   * Whether to display the accepted file types, given that the accept parameter is present. Defaults to true.
   */
  acceptVisible?: undefined | boolean,

  multiple?: undefined | HTMLInputElement['multiple'],
};
export const InputFile = ({
  className,
  unstyled = false,
  containerProps = {},
  inputProps,
  dragAndDrop = false,
  handleFiles = () => {},
  accept,
  acceptVisible = true,
  multiple,
}: InputFileProps) => {
  const dragCounter = React.useRef(0);
  const fileInput = React.useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = React.useState(false);
  
  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const onDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  
  const onDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };
  
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(file => isFileAccepted(file, accept));

      if (validFiles.length > 0) {
        handleFiles(validFiles as unknown as FileList);
      }

      e.dataTransfer.clearData();
      dragCounter.current = 0;
    }
  };

  const onFileUploadClick = () => {
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files.length > 0) {
      const validFiles = Array.from(event.currentTarget.files).filter(file => isFileAccepted(file, accept));
      if (validFiles.length > 0) {
        handleFiles(validFiles as unknown as FileList);
      }
      if (fileInput.current) {
        fileInput.current.value = '';
      }
    }
  };

  const renderFileUploadButton = () => (
    <Button
      className={cx(className, 'bk-input-file__btn--no-drag')}
      onClick={onFileUploadClick}
    >
      upload
    </Button>
  );

  const renderFileInputWithDragAndDrop = () => {
    const acceptArray = accept ? accept.split(',').map(a => a.trim()) : [];
    return (
      // biome-ignore lint/a11y/noStaticElementInteractions: keyboard users can use the button to upload
      // biome-ignore lint/a11y/useKeyWithClickEvents: you can activate it with keyboard navigation without issues
      <div
        className={cx(
          cl['bk-input-file__drag-target'],
          {
            [cl['bk-input-file__drag-target--is-dragging']]: isDragging,
          },
          className,
        )}
        onClick={onFileUploadClick}
        onDragEnter={onDragIn}
        onDragLeave={onDragOut}
        onDragOver={onDrag}
        onDrop={onDrop}
      >
        <div className={cl['bk-input-file__drag-target__inner']}>
          <span>Drag &amp; drop {multiple ? 'files' : 'a file'} or </span>
          <Button
            className={cl['bk-input-file__drag-target__button']}
            onClick={evt => { evt.preventDefault(); }}
          >
            browse
          </Button>
        </div>
        {accept && acceptVisible && (
          <div className={cl['bk-input-file__drag-target__accepted-files']}>
            Accepted file type
            {acceptArray.length > 1 && 's'}
            : {acceptArray.join(', ')}</div>
        )}
      </div>
    );
  };

  return (
    <div
      {...containerProps}
      className={cx(
        'bk',
        { [cl['bk-input-file']]: !unstyled },
        containerProps.className,
        className,
      )}
    >
      <input
        type="file"
        ref={fileInput}
        onChange={onFileChange}
        hidden
        className={cx(cl['bk-input-file__input'], inputProps?.className)}
        {...accept && { accept }}
        {...multiple && { multiple }}
      />
      {dragAndDrop ? renderFileInputWithDragAndDrop() : renderFileUploadButton()}
    </div>
  );
};
