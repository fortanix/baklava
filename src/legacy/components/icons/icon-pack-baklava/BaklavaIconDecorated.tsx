
import { classNames as cx, ComponentPropsWithRef } from '../../../util/component_util';

import * as React from 'react';

import { BaklavaIcon as Icon } from './BaklavaIcon';

import './BaklavaIconDecorated.scss';


export type Decoration =
  | 'highlight' // Note: same as `background-circle` but auto-adapts background color to context
  | 'background-circle'
  | 'border-circle';

/**
 * Extension of `Icon`, but with a visual decoration applied.
*/
type BaklavaIconDecoratedProps = ComponentPropsWithRef<typeof Icon> & {
  decorations?: Array<Decoration>,
  
  // Shorthands
  highlight?: boolean,
  border?: boolean,
};
export const BaklavaIconDecorated = React.forwardRef<HTMLUListElement, BaklavaIconDecoratedProps>((props, ref) => {
  const { className, decorations = [], highlight = false, border = false, ...propsIcon } = props;
  
  const decorationsParsed = [
    ...decorations,
    ...(highlight ? ['highlight'] : []),
    ...(border ? ['border-circle'] : []),
  ];
  
  return (
    <Icon {...propsIcon}
      className={cx(
        'baklava-icon--decorated',
        ...decorationsParsed.map(decoration => `baklava-icon--decorated--${decoration}`),
        props.className,
      )}
    />
  );
});
BaklavaIconDecorated.displayName = 'IconDecorated';
