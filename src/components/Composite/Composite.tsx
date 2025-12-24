/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AVLTree } from 'avl';

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import { mergeProps, useEffectOnce } from '../../util/reactUtil.ts';

import cl from './Composite.module.scss';


export { cl as CompositeClassNames };



export type ItemKey = string;
export type ItemDef = { itemKey: ItemKey };

type CompositeContext = {
  registry: Map<ItemKey, ItemDef & { el: Element }>,
  ordering: AVLTree<ItemKey>,
};
const CompositeContext = React.createContext<null | CompositeContext>(null);
const useCompositeContext = () => {
  const context = React.use(CompositeContext);
  if (context === null) { throw new Error(`Missing CompositeContext provider`); }
  return context;
};
type CompositeItemProps = { ref: React.Ref<Element> };
const useCompositeItem = (itemDef: ItemDef): CompositeItemProps => {
  //const ref = React.useRef<null | Element>(null);
  
  const context = useCompositeContext();
  
  // useEffectOnce(() => {
  //   console.log(`register ${itemDef.itemKey}`);
  // });
  
  const ref = React.useCallback<React.RefCallback<Element>>(el => {
    debugger;
    
    const itemKey = itemDef.itemKey;
    
    if (el === null) {
      console.log(`unregister ${itemKey}`);
      context.ordering.remove(itemKey);
      context.registry.delete(itemKey);
      return;
    }
    
    //const item = context.registry.get(itemKey) ?? null;
    console.log(`register ${itemKey}`);
    
    context.registry.set(itemKey, { itemKey: itemKey, el });
    context.ordering.insert(itemKey);
    
    return () => {
      console.log(`unregister [cb] ${itemKey}`);
      context.ordering.remove(itemKey);
      context.registry.delete(itemKey);
    };
  }, [context, itemDef.itemKey]);
  
  return {
    ref,
  };
};









export type ListItemProps = ComponentProps<'div'> & {
  itemKey: string,
};
export const ListItem = (props: ListItemProps) => {
  const { itemKey, ...propsRest } = props;
  
  const compositeProps = useCompositeItem({ itemKey });
  
  return (
    <div
      {...mergeProps(
        propsRest,
        compositeProps,
        {
          className: cx(
            'bk',
            cl['bk-composite-item'],
            propsRest.className,
          ),
        },
      )}
    />
  );
};

export type ListProps = ComponentProps<'div'> & {
};
export const List = Object.assign(
  (props: ListProps) => {
    const { ...propsRest } = props;
    
    const registry = React.useMemo<CompositeContext['registry']>(() => new Map(), []);
    const registryComparator = React.useCallback((itemKey1: ItemKey, itemKey2: ItemKey) => {
      const el1 = registry.get(itemKey1)?.el ?? null;
      const el2 = registry.get(itemKey2)?.el ?? null;
      
      console.log(`CMP ${itemKey1} ${itemKey2}`, el1, el2);
      
      if (itemKey1 === itemKey2 || el1 === el2) { return 0; }
      
      // if (el1 === null) { console.log(itemKey1, registry); debugger; throw new Error(`Missing item: ${itemKey1}`); }
      // if (el2 === null) { console.log(itemKey2, registry); debugger;  throw new Error(`Missing item: ${itemKey2}`); }
      
      if (el1 === null || el2 === null) { return 0; } // FIXME
      
      return el1.compareDocumentPosition(el2) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    }, [registry]);
    
    const context = React.useMemo<CompositeContext>(() => ({
      registry,
      ordering: new AVLTree<ItemKey>(registryComparator, true),
    }), [registry, registryComparator]);
    
    Object.assign(window, { _c: context }); // DEBUG
    
    useEffectOnce(() => {
      console.log('List effect', context);
      debugger;
    });
    
    return (
      <CompositeContext value={context}>
        <div
          {...propsRest}
          className={cx(
            'bk',
            cl['bk-composite'],
            propsRest.className,
          )}
        />
      </CompositeContext>
    );
  },
  {
    Item: ListItem,
  },
);
