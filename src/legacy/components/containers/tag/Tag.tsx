
import * as React from 'react';
import {
  classNames as cx,
  ComponentPropsWithoutRef,
} from '../../../util/component_util';
import CloseButton from '../../internal/CloseButton';

import './Tag.scss';


type TagProps = ComponentPropsWithoutRef<'div'> & {
  primary?: boolean,
  dashedBorder?: boolean,
  small?: boolean,
  onClose?: () => void,
};
export const Tag = (props: TagProps) => {
  const {
    className = '',
    children,
    primary = false,
    dashedBorder = false,
    small = false,
    onClose,
    ...rest
  } = props;
  
  return (
    <div
      className={cx('bkl-tag', className, {
        'bkl-tag--primary': primary,
        'bkl-tag--dashed-border': dashedBorder,
        'bkl-tag--closable': onClose,
        'bkl-tag--small': small,
      })}
      {...rest}
    >
      {children}
      {onClose && <CloseButton neutral onClose={onClose} small={small}/>}
    </div>
  );
};

Tag.displayName = 'Tag';
