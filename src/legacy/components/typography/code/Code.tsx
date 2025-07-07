
import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import './Code.scss';


type CodeProps = ComponentPropsWithoutRef<'span'>;
export const Code = ({ children, className, ...props }: CodeProps) => (
  <span className={cx('code', className)} {...props}>
    {children}
  </span>
);
