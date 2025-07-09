
import { classNames as cx, ComponentProps } from '../../../util/component_util.tsx';

import './Caption.scss';


type CaptionProps = ComponentProps<'span'> & {
  size?: 'normal' | 'small',
};
export const Caption = ({ children, className, size = 'normal', ...props }: CaptionProps) => (
  <span className={cx('caption', { 'caption--small': size === 'small' }, className)} {...props}>
    {children}
  </span>
);
