/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../../util/componentUtil.ts';

import cl from './InputFile.module.scss';


export { cl as InputFileClassNames };

export const readFile = (
  file: File,
  handleFile: (result: string | ArrayBuffer | null, file: File, error?: Error) => void,
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
  } catch (e) {
    console.error(e);
    handleFile(result, file, e);
  }
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
  
  /** Specify which file extensions are selectable. */
  accept?: undefined | HTMLInputElement['accept'],
};
export const InputFile = ({
  className,
  unstyled = false,
  containerProps = {},
  inputProps,
  dragAndDrop = false,
  handleFiles = () => {},
  accept,
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
      handleFiles(e.dataTransfer.files);
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
      handleFiles(event.currentTarget.files);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
    }
  };
  
  const renderFileUploadButton = () => (
    <a
      className={cx(className, 'bk-input-file__btn--no-drag')}
      onClick={onFileUploadClick}
    >
      upload
    </a>
  );
  
  const renderFileInputWithDragAndDrop = () => {
    return (
      <>TODO</>
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
      />
      {dragAndDrop ? renderFileInputWithDragAndDrop() : renderFileUploadButton()}
    </div>
  );
};
