
import { classNames as cx, ComponentPropsWithRef } from '../../util/component_util';

import * as React from 'react';

import { SpriteIcon as Icon } from './Icon';

import './IconDecorated.scss';


export type Decoration =
  | 'highlight' // Note: same as `background-circle` but auto-adapts background color to context
  | 'background-circle'
  | 'border-circle';

/**
 * Extension of `Icon`, but with a visual decoration applied.
*/
type IconDecoratedProps = ComponentPropsWithRef<typeof Icon> & {
  decorations?: Array<Decoration>,
  
  // Shorthands
  highlight?: boolean,
  border?: boolean,
};
export const IconDecorated = React.forwardRef<HTMLUListElement, IconDecoratedProps>((props, ref) => {
  const { className, decorations = [], highlight = false, border = false, ...propsIcon } = props;
  
  const decorationsParsed = [
    ...decorations,
    ...(highlight ? ['highlight'] : []),
    ...(border ? ['border-circle'] : []),
  ];
  
  return (
    <Icon {...propsIcon}
      className={cx(
        'icon--decorated',
        ...decorationsParsed.map(decoration => `icon--decorated--${decoration}`),
        props.className,
      )}
    />
  );
});
IconDecorated.displayName = 'IconDecorated';
