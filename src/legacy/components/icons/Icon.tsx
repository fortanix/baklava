
import * as ObjectUtil from '../../util/object_util';
import $msg from 'message-tag';

import { classNames as cx, ComponentPropsWithRef } from '../../util/component_util';
import * as React from 'react';

import './Icon.scss';


// https://stackoverflow.com/questions/58979309/checking-if-a-component-is-unmounted-using-react-hooks
const useIsMounted = () => {
  const isMountedRef = React.useRef<boolean>(true);
  const isMounted = React.useCallback(() => isMountedRef.current === true, []);
  
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return isMounted;
};


type UseIconModuleOptions = {
  moduleFormat: 'path' | 'sprite',
};
type IconModule = { id: string, url: string, viewBox: string };
type IconModuleResult = { default: string | object };
const useIconModule = (
  name: string,
  iconPromise: Promise<IconModuleResult>,
  { moduleFormat }: UseIconModuleOptions,
): null | IconModule => {
  const isMounted = useIsMounted();
  const [iconModule, setIconModule] = React.useState<null | IconModule>(null);
  
  React.useEffect(() => {
    iconPromise.then(
      result => {
        if (!isMounted()) { return; }
        
        if (typeof result !== 'object' || result === null || !result.default) {
          throw new TypeError($msg`Unable to load icon module, expected module, given: ${result}`);
        }
        
        const moduleResult = result.default;
        
        const iconModule: IconModule = { id: '', url: '', viewBox: '' };
        if (moduleFormat === 'path') {
          if (typeof moduleResult !== 'string') {
            throw new TypeError($msg`Unable to load icon module. Expected string, given ${moduleResult}`);
          }
          
          Object.assign(iconModule, { url: moduleResult });
        } else if (moduleFormat === 'sprite') {
          if (typeof moduleResult !== 'object' || moduleResult === null) {
            throw new TypeError($msg`Unable to load icon module. Expected object, given ${moduleResult}`);
          }
          
          const id: IconModule['id'] = (() => {
            if (ObjectUtil.hasOwnProp(moduleResult, 'id') && typeof moduleResult.id === 'string') {
              return moduleResult.id;
            } else {
              throw new TypeError($msg`Unable to load icon module. Expected SVG sprite module, given ${moduleResult}`);
            }
          })();
          
          const viewBox: IconModule['viewBox'] = (() => {
            if (ObjectUtil.hasOwnProp(moduleResult, 'viewBox') && typeof moduleResult.viewBox === 'string') {
              return moduleResult.viewBox;
            } else {
              throw new TypeError($msg`Unable to load icon module. Expected SVG sprite module, given ${moduleResult}`);
            }
          })();
          
          const url: IconModule['url'] = (() => {
            if (ObjectUtil.hasOwnProp(moduleResult, 'url') && typeof moduleResult.url === 'string') {
              return moduleResult.url;
            } else if (ObjectUtil.hasOwnProp(moduleResult, 'id')) {
              return `#${moduleResult.id}`;
            } else {
              throw new TypeError($msg`Unable to load icon module. Expected SVG sprite module, given ${moduleResult}`);
            }
          })();
          
          Object.assign(iconModule, { id, viewBox, url });
        } else {
          throw new TypeError($msg`Unable to load icon module, unknown format ${moduleFormat}`);
        }
        
        setIconModule(iconModule);
      },
      reason => {
        console.error('Unable to load icon:', reason);
      },
    );
  }, [iconPromise]);
  
  return iconModule;
};


export type ImgIconProps = ComponentPropsWithRef<'img'> & {
  name: string,
  icon: Promise<IconModuleResult>,
};
export const ImgIcon = React.memo(React.forwardRef<HTMLImageElement, ImgIconProps>((props, ref) => {
  const {
    name,
    icon,
    className = '',
    ...propsRest
  } = props;
  
  const iconModule = useIconModule(name, icon, { moduleFormat: 'path' });
  
  if (iconModule === null) {
    return null;
  }
  
  return (
    <img ref={ref} className={cx('bkl-icon', className)}
      alt={name}
      src={iconModule.url}
      {...propsRest}
    />
  );
}));
ImgIcon.displayName = 'ImgIcon';


export type SpriteIconProps = ComponentPropsWithRef<'svg'> & {
  name: string,
  icon: Promise<IconModuleResult>,
};
export const SpriteIcon = React.memo(React.forwardRef<SVGSVGElement, SpriteIconProps>((props, ref) => {
  const {
    name,
    icon,
    className = '',
    ...propsRest
  } = props;
  
  return null; // TEMP
  
  const iconModule = useIconModule(name, icon, { moduleFormat: 'sprite' });
  
  if (iconModule === null) {
    // Note: render an empty `<svg>` here (rather than something like `null`), to prevent "shifting" of the layout
    return (
      <svg ref={ref} className={cx('bkl-icon', className)} viewBox="0 0 0 0"
        {...propsRest}
      />
    );
  }
  
  return (
    <svg ref={ref} className={cx('bkl-icon', className)}
      data-icon-id={iconModule.id}
      viewBox={iconModule.viewBox}
      {...propsRest}
    >
      <use xlinkHref={iconModule.url}/>
    </svg>
  );
}));
SpriteIcon.displayName = 'SpriteIcon';
