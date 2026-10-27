/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import {
  type Defined,
  type UseControllableStateOptions,
  useControllableState,
  useControllableStateFromProps,
} from './useControllableState.ts';


// Options for the common case where the event type is the state type itself
const makeOptions = <S extends Defined>(defaultStateFallback: S): UseControllableStateOptions<S, S> => ({
  debugName: 'TestComponent',
  propName: 'value',
  defaultStateFallback,
  stateFromEvent: (event: S) => event,
});

describe('useControllableState', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    warnSpy.mockRestore();
  });
  
  describe('uncontrolled mode', () => {
    it('initializes with defaultState when provided', () => {
      const { result } = renderHook(() =>
        useControllableState<string, string>(
          { state: undefined, defaultState: 'default-value', onStateChange: undefined },
          makeOptions<string>('fallback-value'),
        )
      );
      
      expect(result.current.isControlled).toBe(false);
      expect(result.current.state).toBe('default-value');
    });
    
    it('initializes with defaultStateFallback when defaultState is not provided', () => {
      const { result } = renderHook(() =>
        useControllableState<string, string>(
          { state: undefined, defaultState: undefined, onStateChange: undefined },
          makeOptions<string>('fallback-value'),
        )
      );
      
      expect(result.current.state).toBe('fallback-value');
    });
    
    it('updates internal state when requestStateChange is called with a plain value', () => {
      const { result } = renderHook(() =>
        useControllableState<string, string>(
          { state: undefined, defaultState: 'initial', onStateChange: undefined },
          makeOptions<string>('fallback'),
        )
      );
      
      act(() => {
        result.current.requestStateChange('updated');
      });
      
      expect(result.current.state).toBe('updated');
    });
    
    it('updates internal state when requestStateChange is called with an updater function', () => {
      const { result } = renderHook(() =>
        useControllableState<number, number>(
          { state: undefined, defaultState: 1, onStateChange: undefined },
          makeOptions<number>(0),
        )
      );
      
      act(() => {
        result.current.requestStateChange(prev => prev + 1);
      });
      
      expect(result.current.state).toBe(2);
    });
    
    it('queues multiple updater functions against the latest internal state', () => {
      const { result } = renderHook(() =>
        useControllableState<number, number>(
          { state: undefined, defaultState: 1, onStateChange: undefined },
          makeOptions<number>(0),
        )
      );
      
      act(() => {
        result.current.requestStateChange(prev => prev + 1);
        result.current.requestStateChange(prev => prev + 1);
      });
      
      expect(result.current.state).toBe(3);
    });
    
    it('calls onStateChange with the event whenever the uncontrolled state changes, but not on mount', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState<string, string>(
          { state: undefined, defaultState: 'initial', onStateChange },
          makeOptions<string>('fallback'),
        )
      );
      
      expect(onStateChange).not.toHaveBeenCalled();
      
      act(() => {
        result.current.requestStateChange('updated');
      });
      
      expect(onStateChange).toHaveBeenCalledWith('updated');
    });
    
    it('derives the state from the event using stateFromEvent', () => {
      type ChangeEvent = { next: number };
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState<number, ChangeEvent>(
          { state: undefined, defaultState: 1, onStateChange },
          {
            debugName: 'TestComponent',
            propName: 'value',
            defaultStateFallback: 0,
            stateFromEvent: (event: ChangeEvent) => event.next,
          },
        )
      );
      
      act(() => {
        result.current.requestStateChange({ next: 42 });
      });
      
      expect(result.current.state).toBe(42);
      expect(onStateChange).toHaveBeenCalledWith({ next: 42 });
    });
    
    it('passes the event produced by an updater function to onStateChange', () => {
      type ChangeEvent = { next: number };
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState<number, ChangeEvent>(
          { state: undefined, defaultState: 5, onStateChange },
          {
            debugName: 'TestComponent',
            propName: 'value',
            defaultStateFallback: 0,
            stateFromEvent: (event: ChangeEvent) => event.next,
          },
        ),
      );
      
      act(() => {
        result.current.requestStateChange(prev => ({ next: prev * 2 }));
      });
      
      expect(result.current.state).toBe(10);
      expect(onStateChange).toHaveBeenCalledWith({ next: 10 });
    });
    
    it('does not warn when onStateChange is missing while uncontrolled', () => {
      renderHook(() =>
        useControllableState<string, string>(
          { state: undefined, defaultState: 'initial', onStateChange: undefined },
          makeOptions<string>('fallback'),
        )
      );
      
      expect(warnSpy).not.toHaveBeenCalled();
    });
    
    it('does not warn when requestStateChange is called with an updater function', () => {
      const { result } = renderHook(() =>
        useControllableState<number, number>(
          { state: undefined, defaultState: 1, onStateChange: undefined },
          makeOptions<number>(0),
        )
      );
      
      act(() => {
        result.current.requestStateChange(prev => prev + 1);
      });
      
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('controlled mode', () => {
    it('uses the externally-provided state value', () => {
      const { result } = renderHook(() =>
        useControllableState<string, string>(
          { state: 'controlled-value', defaultState: undefined, onStateChange: vi.fn() },
          makeOptions<string>('fallback-value'),
        )
      );
      
      expect(result.current.isControlled).toBe(true);
      expect(result.current.state).toBe('controlled-value');
    });
    
    it('reflects updates to the controlled state prop across rerenders', () => {
      const onStateChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ state }: { state: string }) =>
          useControllableState<string, string>(
            { state, defaultState: undefined, onStateChange },
            makeOptions<string>('fallback-value'),
          ),
        { initialProps: { state: 'first' } },
      );
      
      expect(result.current.state).toBe('first');
      
      rerender({ state: 'second' });
      expect(result.current.state).toBe('second');
    });
    
    it('calls onStateChange with the requested value without mutating local state directly', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState<string, string>(
          { state: 'controlled-value', defaultState: undefined, onStateChange },
          makeOptions<string>('fallback-value'),
        )
      );
      
      act(() => {
        result.current.requestStateChange('next-value');
      });
      
      expect(onStateChange).toHaveBeenCalledWith('next-value');
      // In controlled mode the displayed state still mirrors the `state` prop,
      // since the consumer owns it and hasn't changed the prop itself.
      expect(result.current.state).toBe('controlled-value');
    });
    
    it('passes the event on to onStateChange as-is, without applying stateFromEvent', () => {
      type ChangeEvent = { next: number };
      const onStateChange = vi.fn();
      const stateFromEvent = vi.fn((event: ChangeEvent) => event.next);
      const { result } = renderHook(() =>
        useControllableState<number, ChangeEvent>(
          { state: 5, defaultState: undefined, onStateChange },
          { debugName: 'TestComponent', propName: 'value', defaultStateFallback: 0, stateFromEvent },
        )
      );
      
      act(() => {
        result.current.requestStateChange({ next: 7 });
      });
      
      expect(onStateChange).toHaveBeenCalledWith({ next: 7 });
      expect(stateFromEvent).not.toHaveBeenCalled();
      expect(result.current.state).toBe(5);
    });
    
    it('does not warn when requestStateChange is called with a plain value', () => {
      const { result } = renderHook(() =>
        useControllableState<string, string>(
          { state: 'controlled-value', defaultState: undefined, onStateChange: vi.fn() },
          makeOptions<string>('fallback-value'),
        )
      );
      
      act(() => {
        result.current.requestStateChange('next-value');
      });
      
      expect(warnSpy).not.toHaveBeenCalled();
    });
    
    it('resolves an updater function against the current controlled state', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState<number, number>(
          { state: 5, defaultState: undefined, onStateChange },
          makeOptions<number>(0),
        )
      );
      
      act(() => {
        result.current.requestStateChange(prev => prev + 10);
      });
      
      expect(onStateChange).toHaveBeenCalledWith(15);
    });
    
    it('does not accumulate multiple updater functions within the same render cycle', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableState<number, number>(
          { state: 5, defaultState: undefined, onStateChange },
          makeOptions<number>(0),
        )
      );
      
      act(() => {
        result.current.requestStateChange(prev => prev + 1);
        result.current.requestStateChange(prev => prev + 1);
      });
      
      // Both updaters are resolved against the same (current) controlled state
      expect(onStateChange).toHaveBeenCalledTimes(2);
      expect(onStateChange).toHaveBeenNthCalledWith(1, 6);
      expect(onStateChange).toHaveBeenNthCalledWith(2, 6);
    });
  });
  
  describe('useControllableStateFromProps', () => {
    it('behaves like useControllableState for valid uncontrolled props', () => {
      const { result } = renderHook(() =>
        useControllableStateFromProps<string, string>(
          { defaultState: 'default-value' },
          makeOptions<string>('fallback-value'),
        )
      );
      
      expect(result.current.isControlled).toBe(false);
      expect(result.current.state).toBe('default-value');
      
      act(() => {
        result.current.requestStateChange('updated');
      });
      
      expect(result.current.state).toBe('updated');
      expect(warnSpy).not.toHaveBeenCalled();
    });
    
    it('behaves like useControllableState for valid controlled props', () => {
      const onStateChange = vi.fn();
      const { result } = renderHook(() =>
        useControllableStateFromProps<string, string>(
          { state: 'controlled-value', onStateChange },
          makeOptions<string>('fallback-value'),
        )
      );
      
      expect(result.current.isControlled).toBe(true);
      expect(result.current.state).toBe('controlled-value');
      
      act(() => {
        result.current.requestStateChange('next-value');
      });
      
      expect(onStateChange).toHaveBeenCalledWith('next-value');
      expect(warnSpy).not.toHaveBeenCalled();
    });
    
    it('warns when onStateChange is missing while controlled', () => {
      renderHook(() =>
        useControllableStateFromProps<string, string>(
          { state: 'controlled-value', defaultState: undefined, onStateChange: undefined },
          makeOptions<string>('fallback-value'),
        )
      );
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing onValueChange'),
      );
    });
    
    it('warns when defaultState is passed alongside a controlled state', () => {
      renderHook(() =>
        useControllableStateFromProps<string, string>(
          { state: 'controlled-value', defaultState: 'should-not-be-here', onStateChange: vi.fn() },
          makeOptions<string>('fallback-value'),
        )
      );
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('defaultValue'),
      );
    });
    
    it('prefixes warnings with the debug name and prop name', () => {
      renderHook(() =>
        useControllableStateFromProps<string, string>(
          { state: 'controlled-value', onStateChange: undefined },
          makeOptions<string>('fallback-value'),
        )
      );
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TestComponent.value]'),
      );
    });
  });
  
  describe('controlled <-> uncontrolled transitions', () => {
    it('warns when switching from uncontrolled to controlled after mount', () => {
      const { rerender } = renderHook(
        ({ state }: { state: undefined | string }) =>
          useControllableStateFromProps<string, string>(
            { state, defaultState: undefined, onStateChange: vi.fn() },
            makeOptions<string>('fallback'),
          ),
        { initialProps: { state: undefined as (undefined | string) } },
      );
      
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('switched from'),
      );
      
      rerender({ state: 'now-controlled' });
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('uncontrolled to controlled'),
      );
    });
    
    it('warns when switching from controlled to uncontrolled after mount', () => {
      const { rerender } = renderHook(
        ({ state }: { state: undefined | string }) =>
          useControllableStateFromProps<string, string>(
            { state, defaultState: undefined, onStateChange: vi.fn() },
            makeOptions<string>('fallback'),
          ),
        { initialProps: { state: 'controlled' as (undefined | string) } },
      );
      
      rerender({ state: undefined });
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('controlled to uncontrolled'),
      );
    });
    
    it('does not warn when rerendering without switching mode', () => {
      const { rerender } = renderHook(
        ({ state }: { state: string }) =>
          useControllableState<string, string>(
            { state, defaultState: undefined, onStateChange: vi.fn() },
            makeOptions<string>('fallback'),
          ),
        { initialProps: { state: 'first' } },
      );
      
      rerender({ state: 'second' });
      
      expect(warnSpy).not.toHaveBeenCalled();
    });
    
    it('does not warn on the very first render regardless of mode', () => {
      renderHook(() =>
        useControllableState<string, string>(
          { state: 'controlled', defaultState: undefined, onStateChange: vi.fn() },
          makeOptions<string>('fallback'),
        )
      );
      
      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('switched from'),
      );
    });
  });
});
