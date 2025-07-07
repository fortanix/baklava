
import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import './Caption.scss';


type CaptionProps = ComponentPropsWithoutRef<'span'> & {
  size?: 'normal' | 'small',
};
export const Caption = ({ children, className, size, ...props }: CaptionProps) => (
  <span className={cx('caption', { 'caption--small': size === 'small' }, className)} {...props}>
    {children}
  </span>
);
Caption.defaultProps = {
  size: 'normal',
};
