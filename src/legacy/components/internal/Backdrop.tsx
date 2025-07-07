
import cx from 'classnames';
import * as React from 'react';

import './Backdrop.scss';

export type BackdropProps = JSX.IntrinsicElements['div'] & {
  active: boolean,
  scrollable?: boolean,
};

const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>((props, ref) => {
  const {
    children,
    className,
    active,
    onClick,
    onMouseDown,
    scrollable,
    onKeyDown,
  } = props;

  return (
    <div
      role="button"
      ref={ref}
      className={cx('bkl-backdrop', className, {
        'bkl-backdrop--active': active,
        'bkl-backdrop--scrollable': scrollable,
      })}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
});

Backdrop.displayName = 'Backdrop';

export default Backdrop;
