
import * as React from 'react';
import { useMemoOnce } from '../../util/reactUtil.ts';


export type ItemKey = string;

const internalKey = Symbol('baklava.CompoundList.internal');
export type CompoundListContext = {
  [internalKey]: {
    registry: Map<ItemKey, Element>,
    ordering: Array<ItemKey>,
  },
  
  componentId: string,
  getItemsOrdering: () => Array<ItemKey>,
};
export const CompoundListContext = React.createContext<null | CompoundListContext>(null);

export const useCompoundList = <E extends Element>() => {
  const componentId = React.useId();
  const ref = React.useRef<E>(null);
  
  const contextInternal = useMemoOnce<CompoundListContext[typeof internalKey]>(() => ({
    registry: new Map(),
    ordering: [],
  }));
  
  const getItemsOrdering = React.useCallback<CompoundListContext['getItemsOrdering']>(() => {
    const cachedOrdering = contextInternal.ordering;
    const listEl = ref.current;
    
    if (listEl === null) {
      return cachedOrdering;
    }
    
    const ordering = Array.from(listEl.querySelectorAll(`[data-bk-compound-list-id=${JSON.stringify(componentId)}]`))
      .flatMap(itemEl => {
        if (!(itemEl instanceof HTMLElement)) { return []; }
        
        const itemId = itemEl.dataset.bkCompoundListItemId;
        return typeof itemId === 'string' ? [itemId] : [];
      });
    
    // Cache the computed ordering
    contextInternal.ordering = ordering;
    
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
  
  const { registry } = context[internalKey];
  
  // TEMP
  Object.assign(window, { _c: context, _ci: context[internalKey] });
  
  const ref = React.useCallback<React.RefCallback<E>>(el => {
    if (el === null) {
      registry.delete(itemKey);
    } else {
      registry.set(itemKey, el);
    }
    
    return () => {
      registry.delete(itemKey);
    };
  }, [itemKey, registry]);
  
  return {
    ref,
    'data-bk-compound-list-id': context.componentId,
    'data-bk-compound-list-item-id': itemKey,
  };
};
