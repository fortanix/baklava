
import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';

import './Headings.scss';


type H1Props = ComponentPropsWithoutRef<'h1'>;
export const H1 = ({ children, className, ...props }: H1Props) => (
  <h1 className={cx('bkl-heading heading-1', className)} {...props}>
    {children}
  </h1>
);
H1.displayName = 'H1';

type H2Props = ComponentPropsWithoutRef<'h2'>;
export const H2 = ({ children, className, ...props }: H2Props) => (
  <h2 className={cx('bkl-heading heading-2', className)} {...props}>
    {children}
  </h2>
);
H2.displayName = 'H2';

type H3Props = ComponentPropsWithoutRef<'h3'>;
export const H3 = ({ children, className, ...props }: H3Props) => (
  <h3 className={cx('bkl-heading heading-3', className)} {...props}>
    {children}
  </h3>
);
H3.displayName = 'H3';

type H4Props = ComponentPropsWithoutRef<'h4'>;
export const H4 = ({ children, className, ...props }: H4Props) => (
  <h4 className={cx('bkl-heading heading-4', className)} {...props}>
    {children}
  </h4>
);
H4.displayName = 'H4';

type H5Props = ComponentPropsWithoutRef<'h5'>;
export const H5 = ({ children, className, ...props }: H5Props) => (
  <h5 className={cx('bkl-heading heading-5', className)} {...props}>
    {children}
  </h5>
);
H5.displayName = 'H5';

type H6Props = ComponentPropsWithoutRef<'h6'>;
export const H6 = ({ children, className, ...props }: H6Props) => (
  <h6 className={cx('bkl-heading heading-6', className)} {...props}>
    {children}
  </h6>
);
H6.displayName = 'H6';
