
import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import './Entity.scss';


type EntityProps = ComponentPropsWithoutRef<'span'> & {
  size?: 'normal' | 'small',
};
export const Entity = ({ children, className, size, ...props }: EntityProps) => (
  <span className={cx('entity', { 'entity--small': size === 'small' }, className)} {...props}>
    {children}
  </span>
);
Entity.defaultProps = {
  size: 'normal',
};
