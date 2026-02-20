/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx } from '../../../../util/componentUtil.ts';

import { IconButton } from '../../../actions/IconButton/IconButton.tsx';

import cl from './FileInfo.module.scss';


const roundFileSize = (fileSize: number): string => {
  if (fileSize < 1000) {
    return `${fileSize} B`;
  }
  if (fileSize < 1000000) {
    return `${Math.round(fileSize / 1000)} kB`;
  }
  if (fileSize < 1000000000) {
    return `${Math.round(fileSize / 1000000)} MB`;
  }
  return `${Math.round(fileSize / 1000000000)} GB`;
}

export type FileInfoProps = React.ComponentPropsWithoutRef<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  
  /** A file name to be displayed. */
  fileName?: undefined | string,
  
  /** File size to be displayed. */
  fileSize?: undefined | number,
  
  /** A function to remove / unselect the file. */
  onDelete?: undefined | (() => void),
};
export const FileInfo = (props: FileInfoProps) => {
  const {
    unstyled = false,
    fileName,
    fileSize,
    onDelete,
  } = props;
  
  if (!fileName) { return null; }
  
  return (
    <div
      className={cx(
        'bk',
        { [cl['bk-file-info']]: !unstyled },
        props.className,
      )}
    >
      <span className={cl['bk-file-info__name']}>
        {fileName}
        {fileSize && ` (${roundFileSize(fileSize)})`}
      </span>
      {onDelete &&
        <IconButton
          label="Delete"
          icon="delete"
          className={cl['bk-file-info__delete-icon']}
          onClick={onDelete}
        />
      }
    </div>
  );
};
