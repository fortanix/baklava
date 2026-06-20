/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import { usePrevious } from '../reactUtil.ts';

import { useControllableState } from './useControllableState.ts';


describe('usePrevious', () => {
  it('returns undefined on the initial render', () => {
    const { result } = renderHook(() => usePrevious('first'));
    expect(result.current).toBeUndefined();
  });

  it('returns the previous value after a rerender', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'first' },
    });

    expect(result.current).toBeUndefined();

    rerender({ value: 'second' });
    expect(result.current).toBe('first');

    rerender({ value: 'third' });
    expect(result.current).toBe('second');
  });

  it('tracks previous values across multiple types', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 },
    });

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });

  it('keeps returning the last value if rerendered with the same value', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    expect(result.current).toBe('a');

    rerender({ value: 'b' });
    expect(result.current).toBe('b');
  });
});

describe('useControllableState', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  const baseProps = {
    componentName: 'TestComponent',
    propName: 'value',
  };

  describe('uncontrolled mode', () => {
    it('initializes with stateDefault when provided', () => {
      const { result } = renderHook(() =>
        useControllableState({
          ...baseProps,
          state: undefined,
          stateDefault: 'default-value',
          stateFallback: 'fallback-value',
          onUpdateState: undefined,
        })
      );

      expect(result.current.isControlled).toBe(false);
      expect(result.current.state).toBe('default-value');
    });

    it('initializes with stateFallback when stateDefault is not provided', () => {
      const { result } = renderHook(() =>
        useControllableState({
          ...baseProps,
          state: undefined,
          stateDefault: undefined,
          stateFallback: 'fallback-value',
          onUpdateState: undefined,
        })
      );

      expect(result.current.state).toBe('fallback-value');
    });

    it('updates internal state when setState is called with a plain value', () => {
      const { result } = renderHook(() =>
        useControllableState({
          ...baseProps,
          state: undefined,
          stateDefault: 'initial',
          stateFallback: 'fallback',
          onUpdateState: undefined,
        })
      );

      act(() => {
        result.current.updateState('updated');
      });

      expect(result.current.state).toBe('updated');
    });

    it('updates internal state when setState is called with an updater function', () => {
      const { result } = renderHook(() =>
        useControllableState<number>({
          ...baseProps,
          state: undefined,
          stateDefault: 1,
          stateFallback: 0,
          onUpdateState: undefined,
        })
      );

      act(() => {
        result.current.updateState((prev) => prev + 1);
      });

      expect(result.current.state).toBe(2);
    });

    it('calls onUpdateState whenever the uncontrolled state changes', () => {
      const onUpdateState = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({
          ...baseProps,
          state: undefined,
          stateDefault: 'initial',
          stateFallback: 'fallback',
          onUpdateState,
        })
      );

      // The hook fires an effect on mount as well, syncing the initial value.
      expect(onUpdateState).toHaveBeenCalledWith('initial');

      act(() => {
        result.current.updateState('updated');
      });

      expect(onUpdateState).toHaveBeenCalledWith('updated');
    });

    it('does not warn when onUpdateState is missing while uncontrolled', () => {
      renderHook(() =>
        useControllableState({
          ...baseProps,
          state: undefined,
          stateDefault: 'initial',
          stateFallback: 'fallback',
          onUpdateState: undefined,
        })
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('controlled mode', () => {
    it('uses the externally-provided state value', () => {
      const { result } = renderHook(() =>
        useControllableState({
          ...baseProps,
          state: 'controlled-value',
          stateDefault: undefined,
          stateFallback: 'fallback-value',
          onUpdateState: vi.fn(),
        })
      );

      expect(result.current.isControlled).toBe(true);
      expect(result.current.state).toBe('controlled-value');
    });

    it('reflects updates to the controlled state prop across rerenders', () => {
      const onUpdateState = vi.fn();
      const { result, rerender } = renderHook(
        ({ state }) =>
          useControllableState({
            ...baseProps,
            state,
            stateDefault: undefined,
            stateFallback: 'fallback-value',
            onUpdateState,
          }),
        { initialProps: { state: 'first' } }
      );

      expect(result.current.state).toBe('first');

      rerender({ state: 'second' });
      expect(result.current.state).toBe('second');
    });

    it('calls onUpdateState with the dispatched value without mutating local state directly', () => {
      const onUpdateState = vi.fn();
      const { result } = renderHook(() =>
        useControllableState({
          ...baseProps,
          state: 'controlled-value',
          stateDefault: undefined,
          stateFallback: 'fallback-value',
          onUpdateState,
        })
      );

      act(() => {
        result.current.updateState('next-value');
      });

      expect(onUpdateState).toHaveBeenCalledWith('next-value');
      // In controlled mode the displayed state still mirrors the `state` prop,
      // since the consumer owns it and hasn't changed the prop itself.
      expect(result.current.state).toBe('controlled-value');
    });

    it('resolves an updater function against the current controlled state', () => {
      const onUpdateState = vi.fn();
      const { result } = renderHook(() =>
        useControllableState<number>({
          ...baseProps,
          state: 5,
          stateDefault: undefined,
          stateFallback: 0,
          onUpdateState,
        })
      );

      act(() => {
        result.current.updateState((prev) => prev + 10);
      });

      expect(onUpdateState).toHaveBeenCalledWith(15);
    });

    it('warns when onUpdateState is missing while controlled', () => {
      renderHook(() =>
        useControllableState({
          ...baseProps,
          state: 'controlled-value',
          stateDefault: undefined,
          stateFallback: 'fallback-value',
          onUpdateState: undefined,
        })
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing')
      );
    });

    it('warns when stateDefault is passed alongside a controlled state', () => {
      renderHook(() =>
        useControllableState({
          ...baseProps,
          state: 'controlled-value',
          stateDefault: 'should-not-be-here',
          stateFallback: 'fallback-value',
          onUpdateState: vi.fn(),
        })
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('valueDefault')
      );
    });
  });

  describe('controlled <-> uncontrolled transitions', () => {
    it('warns when switching from uncontrolled to controlled after mount', () => {
      const { rerender } = renderHook(
        ({ state }: { state: string | undefined }) =>
          useControllableState({
            ...baseProps,
            state,
            stateDefault: 'default',
            stateFallback: 'fallback',
            onUpdateState: vi.fn(),
          }),
        { initialProps: { state: undefined } }
      );

      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('switched from')
      );

      act(() => {
        rerender({ state: 'now-controlled' });
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('uncontrolled to controlled')
      );
    });

    it('warns when switching from controlled to uncontrolled after mount', () => {
      const { rerender } = renderHook(
        ({ state }: { state: string | undefined }) =>
          useControllableState({
            ...baseProps,
            state,
            stateDefault: undefined,
            stateFallback: 'fallback',
            onUpdateState: vi.fn(),
          }),
        { initialProps: { state: 'controlled' } }
      );

      act(() => {
        rerender({ state: undefined });
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('controlled to uncontrolled')
      );
    });

    it('does not warn on the very first render regardless of mode', () => {
      renderHook(() =>
        useControllableState({
          ...baseProps,
          state: 'controlled',
          stateDefault: undefined,
          stateFallback: 'fallback',
          onUpdateState: vi.fn(),
        })
      );

      expect(warnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('switched from')
      );
    });
  });
});
