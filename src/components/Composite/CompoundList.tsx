
import * as React from 'react';
import { useMemoOnce } from '../../util/reactUtil.ts';


export type ItemKey = string;

const internalKey = Symbol('baklava.CompoundList.internal');
export type CompoundListContext = {
  /**
   * Internal bookkeeping. Updated through mutation to support a large number of items and prevent the cost of
   * immutable updates to the registry/ordering.
   */
  [internalKey]: {
    registry: Map<ItemKey, Element>,
    orderingCache: Array<ItemKey>,
    orderingDirty: boolean, // Whether `ordering` needs to be recomputed
  },
  
  /** Unique component ID for the current list component. */
  componentId: string,
  /** Compute the ordered list of item keys, sorted by DOM order. */
  getItemsOrdering: () => Array<ItemKey>,
};
export const CompoundListContext = React.createContext<null | CompoundListContext>(null);

export const useCompoundList = <E extends Element>() => {
  const componentId = React.useId();
  const ref = React.useRef<E>(null);
  
  const contextInternal = useMemoOnce<CompoundListContext[typeof internalKey]>(() => ({
    registry: new Map(),
    orderingCache: [],
    orderingDirty: false,
  }));
  
  const getItemsOrdering = React.useCallback<CompoundListContext['getItemsOrdering']>(() => {
    const cachedOrdering = contextInternal.orderingCache;
    const listEl = ref.current;
    
    if (listEl === null || contextInternal.orderingDirty === false) {
      return cachedOrdering;
    }
    
    const ordering = Array.from(listEl.querySelectorAll(`[data-bk-compound-list-id=${JSON.stringify(componentId)}]`))
      .flatMap(itemEl => {
        if (!(itemEl instanceof HTMLElement)) { return []; }
        
        const itemId = itemEl.dataset.bkCompoundListItemId;
        return typeof itemId === 'string' ? [itemId] : [];
      });
    
    // Cache the computed ordering
    contextInternal.orderingCache = ordering;
    
    return ordering;
  }, [componentId]);
  
  const context = React.useMemo(() => ({
    [internalKey]: contextInternal,
    componentId,
    getItemsOrdering,
  }), [componentId, getItemsOrdering]);
  
  const Provider = useMemoOnce(() => ({ children }: React.PropsWithChildren) =>
    <CompoundListContext value={context}>{children}</CompoundListContext>,
  );
  
  return {
    Provider,
    props: { ref },
  };
};

type UseCompoundListParams = { itemKey: ItemKey };
export const useCompoundListItem = <E extends Element>({ itemKey }: UseCompoundListParams) => {
  const context = React.use(CompoundListContext);
  if (context === null) { throw new Error(`Missing CompoundListContext provider`); }
  
  const contextInternal = context[internalKey];
  
  // TEMP: debug
  Object.assign(window, { _c: context, _ci: context[internalKey] });
  
  const ref = React.useCallback<React.RefCallback<E>>(el => {
    const { registry } = contextInternal;
    
    // Mark the `ordering` as dirty, since the list may have been changed/reordered
    contextInternal.orderingDirty = true;
    
    if (el === null) {
      registry.delete(itemKey);
    } else {
      registry.set(itemKey, el);
    }
    
    return () => {
      // Mark the `ordering` as dirty, since this item may have been deleted
      contextInternal.orderingDirty = true;
      
      registry.delete(itemKey);
    };
  }, [itemKey, contextInternal]);
  
  return {
    ref,
    'data-bk-compound-list-id': context.componentId,
    'data-bk-compound-list-item-id': itemKey,
  };
};
