
import { createStore } from 'zustand';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  type ItemKey,
  createCollectionSlice,
  useCollectionWith,
  useCollectionItemWith,
  useCollectionContext,
  useCollection,
  useCollectionItem,
} from './CollectionStore.tsx';


//
// Helpers
//

const makeStore = (collectionId = 'test-coll') => createStore(createCollectionSlice({ collectionId }));

//
// createCollectionSlice (pure store, no React)
//

describe('createCollectionSlice', () => {
  it('exposes the collectionId', () => {
    const store = makeStore('my-id');
    expect(store.getState().collectionId).toBe('my-id');
  });
  
  it('starts dirty so the first consumeDirty() returns true', () => {
    const store = makeStore();
    expect(store.getState().consumeDirty()).toBe(true);
  });
  
  it('clears the dirty flag after consumeDirty()', () => {
    const store = makeStore();
    store.getState().consumeDirty(); // clears initial dirty
    expect(store.getState().consumeDirty()).toBe(false);
  });
  
  it('registerItem adds a key and sets dirty', () => {
    const store = makeStore();
    store.getState().consumeDirty(); // clear initial dirty

    const el = document.createElement('div');
    store.getState().registerItem('a', el);

    expect(store.getState().getItemKeys()).toEqual(new Set(['a']));
    expect(store.getState().consumeDirty()).toBe(true);
  });
  
  it('registerItem warns on duplicate keys', () => {
    const store = makeStore();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const el = document.createElement('div');

    store.getState().registerItem('dup', el);
    store.getState().registerItem('dup', el);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("duplicate item key 'dup'"),
    );
    warn.mockRestore();
  });
  
  it('unregisterItem removes a key and sets dirty', () => {
    const store = makeStore();
    const el = document.createElement('div');
    store.getState().registerItem('a', el);
    store.getState().consumeDirty(); // clear
    
    store.getState().unregisterItem('a');
    
    expect(store.getState().getItemKeys()).toEqual(new Set());
    expect(store.getState().consumeDirty()).toBe(true);
  });
  
  it('unregisterItem is a no-op for unknown keys and does not set dirty', () => {
    const store = makeStore();
    store.getState().consumeDirty(); // clear initial dirty
    
    store.getState().unregisterItem('ghost');
    
    expect(store.getState().consumeDirty()).toBe(false);
  });
  
  it('getItemKeys returns a snapshot set, not a live reference', () => {
    const store = makeStore();
    const el = document.createElement('div');
    store.getState().registerItem('a', el);
    
    const snapshot = store.getState().getItemKeys();
    store.getState().registerItem('b', document.createElement('span'));
    
    // The original snapshot must not have changed.
    expect(snapshot).toEqual(new Set(['a']));
  });
  
  it('tracks multiple items independently', () => {
    const store = makeStore();
    const elA = document.createElement('div');
    const elB = document.createElement('li');
    
    store.getState().registerItem('a', elA);
    store.getState().registerItem('b', elB);
    
    expect(store.getState().getItemKeys()).toEqual(new Set(['a', 'b']));
    
    store.getState().unregisterItem('a');
    expect(store.getState().getItemKeys()).toEqual(new Set(['b']));
  });
});

//
// useCollectionWith
//

describe('useCollectionWith', () => {
  it('renders props with the correct data attribute', () => {
    const store = makeStore('coll-42');
    
    const Fixture = () => {
      const { props } = useCollectionWith(store);
      return <div data-label="root" {...props}/>;
    };
    
    render(<Fixture/>);
    expect(screen.getByTestId('root')).toHaveAttribute('data-bk-coll-id', 'coll-42');
  });
  
  it('calls onItemsChange when items are registered', () => {
    const store = makeStore('coll-1');
    const onItemsChange = vi.fn();
    
    // Pre-register an item so the first layout effect finds a dirty registry.
    const el = document.createElement('div');
    store.getState().registerItem('item-1', el);
    
    const Fixture = () => {
      useCollectionWith(store, { onItemsChange });
      return null;
    };
    
    render(<Fixture/>);
    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(onItemsChange).toHaveBeenCalledWith(new Set(['item-1']));
  });
  
  it('does not call onItemsChange when registry is not dirty', () => {
    const store = makeStore('coll-2');
    store.getState().consumeDirty(); // clear the initial dirty flag
    const onItemsChange = vi.fn();
    
    const Fixture = () => {
      useCollectionWith(store, { onItemsChange });
      return null;
    };
    
    render(<Fixture/>);
    expect(onItemsChange).not.toHaveBeenCalled();
  });
});

//
// useCollectionItemWith
//

describe('useCollectionItemWith', () => {
  it('attaches item data attributes to the element', () => {
    const store = makeStore('coll-x');
    
    const Fixture = () => {
      const { props } = useCollectionItemWith<HTMLDivElement>(store, { itemKey: 'item-a' });
      return <div data-label="item" {...props}/>;
    };
    
    render(<Fixture/>);
    const el = screen.getByTestId('item');
    expect(el).toHaveAttribute('data-bk-coll-parent', 'coll-x');
    expect(el).toHaveAttribute('data-bk-coll-item', 'item-a');
  });
  
  it('registers the element in the store on mount', () => {
    const store = makeStore('coll-x');
    
    const Fixture = () => {
      const { props } = useCollectionItemWith<HTMLDivElement>(store, { itemKey: 'item-b' });
      return <div {...props}/>;
    };
    
    render(<Fixture/>);
    expect(store.getState().getItemKeys()).toContain('item-b');
  });
  
  it('unregisters the element when unmounted', () => {
    const store = makeStore('coll-x');
    
    const Fixture = () => {
      const { props } = useCollectionItemWith<HTMLDivElement>(store, { itemKey: 'item-c' });
      return <div {...props}/>;
    };
    
    const { unmount } = render(<Fixture/>);
    expect(store.getState().getItemKeys()).toContain('item-c');
    
    unmount();
    expect(store.getState().getItemKeys()).not.toContain('item-c');
  });
});

//
// useCollection + useCollectionItem (context-based hooks)
//

describe('useCollection / useCollectionItem integration', () => {
  it('Provider supplies context consumed by useCollectionItem', () => {
    let capturedStore: ReturnType<typeof makeStore> | null = null;
    
    const Child = () => {
      const { store } = useCollectionItem<HTMLLIElement>({ itemKey: 'child-1' });
      capturedStore = store;
      const { itemProps } = useCollectionItem<HTMLLIElement>({ itemKey: 'child-1' });
      return <li data-label="child" {...itemProps}/>;
    };
    
    const Parent = () => {
      const { Provider, props } = useCollection();
      return (
        <Provider>
          <ul data-label="parent" {...props}>
            <Child/>
          </ul>
        </Provider>
      );
    };
    
    render(<Parent/>);
    
    expect(screen.getByTestId('child')).toHaveAttribute('data-bk-coll-item', 'child-1');
    expect(capturedStore).not.toBeNull();
    expect(capturedStore!.getState().getItemKeys()).toContain('child-1');
  });
  
  it('useCollection props carry a data-bk-coll-id attribute', () => {
    const Parent = () => {
      const { Provider, props } = useCollection();
      return (
        <Provider>
          <div data-label="parent" {...props}/>
        </Provider>
      );
    };
    
    render(<Parent/>);
    expect(screen.getByTestId('parent')).toHaveAttribute('data-bk-coll-id');
  });
  
  it('onItemsChange fires with correct keys after children mount', () => {
    const onItemsChange = vi.fn();
    
    const Child = ({ itemKey }: { itemKey: string }) => {
      const { itemProps } = useCollectionItem<HTMLLIElement>({ itemKey });
      return <li {...itemProps}/>;
    };
    
    const Parent = () => {
      const { Provider, props } = useCollection({ onItemsChange });
      return (
        <Provider>
          <ul {...props}>
            <Child itemKey="a"/>
            <Child itemKey="b"/>
          </ul>
        </Provider>
      );
    };
    
    render(<Parent/>);
    // onItemsChange may be called once or multiple times depending on batching;
    // what matters is that the final call includes both keys.
    const lastCall = onItemsChange.mock.calls.at(-1)![0] as Set<ItemKey>;
    expect(lastCall).toEqual(new Set(['a', 'b']));
  });

  it('unregisters items when children unmount', () => {
    let capturedStore: ReturnType<typeof makeStore> | null = null;
    
    const Child = ({ itemKey }: { itemKey: string }) => {
      const { store, itemProps } = useCollectionItem<HTMLLIElement>({ itemKey });
      capturedStore = store;
      return <li {...itemProps}/>;
    };
    
    const Parent = ({ showB }: { showB: boolean }) => {
      const { Provider, props } = useCollection();
      return (
        <Provider>
          <ul {...props}>
            <Child itemKey="a"/>
            {showB && <Child itemKey="b"/>}
          </ul>
        </Provider>
      );
    };
    
    const { rerender } = render(<Parent showB/>);
    expect(capturedStore!.getState().getItemKeys()).toEqual(new Set(['a', 'b']));
    
    rerender(<Parent showB={false}/>);
    expect(capturedStore!.getState().getItemKeys()).toEqual(new Set(['a']));
  });
  
  it('throws when useCollectionItem is used without a Provider', () => {
    // Suppress the React error boundary noise in test output.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const Orphan = () => {
      useCollectionItem({ itemKey: 'x' });
      return null;
    };
    
    expect(() => render(<Orphan/>)).toThrow("Missing 'CollectionContext' provider");
    consoleError.mockRestore();
  });
  
  it('useCollectionContext throws when no provider is present', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const Orphan = () => {
      useCollectionContext();
      return null;
    };
    
    expect(() => render(<Orphan/>)).toThrow("Missing 'CollectionContext' provider");
    consoleError.mockRestore();
  });
  
  it('store reference from useCollection is stable across re-renders', () => {
    const stores: Array<ReturnType<typeof makeStore>> = [];
    
    const Parent = () => {
      const { store, Provider, props } = useCollection();
      stores.push(store);
      return <Provider><div {...props}/></Provider>;
    };
    
    const { rerender } = render(<Parent/>);
    rerender(<Parent/>);
    
    expect(stores[0]).toBe(stores[1]);
  });
});
