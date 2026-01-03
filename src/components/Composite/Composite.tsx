/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//import { AVLTree } from 'avl';

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../util/componentUtil.ts';
import { mergeProps } from '../../util/reactUtil.ts';

import { Button } from '../actions/Button/Button.tsx';

import cl from './Composite.module.scss';


export { cl as CompositeClassNames };



export type ItemKey = string;
export type ItemDef = { itemKey: ItemKey };

type CompositeContext = {
  componentId: string,
  
  // Internal bookkeeping (mutable)
  registry: Map<ItemKey, ItemDef & { el: Element }>,
  //orderingAvl: AVLTree<ItemKey>,
  ordering: Array<ItemKey>,
  needsReordering: boolean,
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
  
  React.useEffect(() => {
    console.log(`effect ${itemDef.itemKey}`);
  });
  
  const ref = React.useCallback<React.RefCallback<Element>>(el => {
    const itemKey = itemDef.itemKey;
    console.log('REF', itemKey);
    
    context.needsReordering = true;
    
    
    if (el === null) {
      // console.log(`unregister [arg] ${itemKey}`);
      //context.orderingAvl.remove(itemKey);
      context.registry.delete(itemKey);
      return;
    }
    
    //const item = context.registry.get(itemKey) ?? null;
    // console.log(`register ${itemKey}`);
    context.registry.set(itemKey, { itemKey: itemKey, el });
    //context.orderingAvl.insert(itemKey);
    
    return () => {
      console.log('REF [cleanup]', itemKey);
      
      context.needsReordering = true;
      
      // console.log(`unregister [cb] ${itemKey}`);
      //context.orderingAvl.remove(itemKey);
      context.registry.delete(itemKey);
    };
  }, [context, itemDef.itemKey]);
  
  return {
    ref,
  };
};









export type ListItemProps = React.ComponentProps<typeof Button> & {
  itemKey: string,
};
export const ListItem = (props: ListItemProps) => {
  const { itemKey, ...propsRest } = props;
  
  const { componentId } = useCompositeContext();
  const compositeProps = useCompositeItem({ itemKey });
  
  return (
    <Button
      unstyled
      {...mergeProps(
        propsRest,
        compositeProps,
        {
          //id: `list-${componentId}-${itemKey}`,
          'data-bk-list-id': componentId,
          'data-bk-list-item-id': itemKey,
          className: cx(
            'bk',
            cl['bk-list-item'],
            propsRest.className,
          ),
          onPress: () => {},
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
    
    const componentId = React.useId();
    const context = React.useMemo<CompositeContext>(() => ({
      componentId,
      registry,
      //orderingAvl: new AVLTree<ItemKey>(registryComparator, true),
      ordering: [],
      needsReordering: false,
    }), [componentId, registry]);
    
    Object.assign(window, { _c: context }); // DEBUG
    
    React.useEffect(() => {
      console.log('List effect', context);
      
      // FIXME: this won't work if the items only get reordered but no insertions/removals (`ref` callbacks too late)
      if (context.needsReordering) {
        // TODO: instead of `document` use a list `ref`
        context.ordering = Array.from(document.querySelectorAll(`[data-bk-list-id=${componentId}]`))
          .flatMap(item => {
            if (!(item instanceof HTMLElement)) { return []; }
            
            const itemId = item.dataset.bkListItemId;
            return typeof itemId === 'string' ? [itemId] : [];
          });
        context.needsReordering = false;
        console.log('REORDERED', context.ordering);
      }
    });
    
    return (
      <CompositeContext value={context}>
        <div
          {...propsRest}
          data-component-id={`bk-list-${componentId}`}
          className={cx(
            'bk',
            cl['bk-list'],
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
