
import * as ObjectUtil from '../../../util/object_util';

import * as React from 'react';
import { SpriteIcon } from '../Icon';

import icons from '../../../icons';


export type IconKey = keyof typeof icons;

export const iconKeys: Array<IconKey> = ObjectUtil.keys(icons);
export const isIconKey = (icon: unknown): icon is IconKey => {
  return typeof icon === 'string' && (iconKeys as Array<string>).includes(icon);
};


const iconsCache = new Map();

type SpriteIconRef = React.ElementRef<typeof SpriteIcon>;
type IconProps = React.ComponentPropsWithoutRef<'svg'> & {
  icon: IconKey,
};
export const BaklavaIcon = React.memo(React.forwardRef<SpriteIconRef, IconProps>(({ icon, ...props }, ref) => {
  const iconExists = Object.prototype.hasOwnProperty.call(icons, icon);
  
  const iconPromise = React.useMemo(() => {
    if (!iconExists) { return null; }
    
    const loadIcon = icons[icon].loadSprite;
    
    if (!iconsCache.has(icon)) {
      iconsCache.set(icon, loadIcon());
    }
    
    return iconsCache.get(icon);
  }, [icon]);
  
  if (!iconExists) {
    console.error(`Missing icon ${icon}`);
    return null;
  }
  
  return (
    <SpriteIcon
      key={icon} // Force remount when `icon` changes
      ref={ref}
      name={icon}
      icon={iconPromise}
      {...props}
    />
  );
}));
