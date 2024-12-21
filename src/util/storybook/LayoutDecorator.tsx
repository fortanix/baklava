
import { classNames as cx, type ComponentProps } from '../componentUtil.ts';

import cl from './LayoutDecorator.module.scss';


/**
 * Utility component to wrap around storybook stories to provide a nicer base layout.
 */
export type LayoutDecoratorProps = ComponentProps<'div'> & {
  size?: undefined | 'small' | 'medium' | 'large',
};
export const LayoutDecorator = (props: LayoutDecoratorProps) => {
  const {
    children,
    size = 'medium',
    ...propsRest
  } = props;
  
  return (
    <div
      {...propsRest}
      className={cx(
        { [cl['util-layout-decorator']]: true },
        { [cl['util-layout-decorator--small']]: size === 'small' },
        { [cl['util-layout-decorator--large']]: size === 'large' },
        propsRest.className,
      )}
    >
      {children}
    </div>
  );
};
