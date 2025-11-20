/* Copyright (c) Fortanix, Inc.
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
 * the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as React from 'react';

import { useFloatingElement, useFloatingElementArrow } from './useFloatingElement.tsx';
import * as FloatingUIReact from '@floating-ui/react';

// Mock floating-ui/react
vi.mock('@floating-ui/react', () => ({
  useFloating: vi.fn(() => ({
    context: {
      open: false,
      placement: 'top',
      elements: { floating: null },
      middlewareData: { arrow: null },
    },
    refs: {
      setReference: vi.fn(),
      setFloating: vi.fn(),
    },
    placement: 'top',
    floatingStyles: {},
  })),
  useRole: vi.fn(() => ({})),
  useClick: vi.fn(() => ({})),
  useFocus: vi.fn(() => ({})),
  useHover: vi.fn(() => ({})),
  useDismiss: vi.fn(() => ({})),
  useDelayGroup: vi.fn(() => ({ delay: { open: 500, close: 200 } })),
  useInteractions: vi.fn(() => ({
    getReferenceProps: vi.fn(() => ({})),
    getFloatingProps: vi.fn(() => ({})),
    getItemProps: vi.fn(() => ({})),
  })),
  useTransitionStatus: vi.fn(() => ({ isMounted: false })),
  autoUpdate: vi.fn(() => vi.fn()),
  offset: vi.fn(),
  flip: vi.fn(),
  shift: vi.fn(),
  limitShift: vi.fn(),
  hide: vi.fn(),
  arrow: vi.fn(),
}));

describe('useFloatingElement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    test('should return expected values with default options', () => {
      const { result } = renderHook(() => useFloatingElement());

      expect(result.current).toMatchObject({
        isOpen: false,
        isMounted: false,
        refs: expect.any(Object),
        placement: expect.any(String),
        floatingStyles: expect.any(Object),
        getReferenceProps: expect.any(Function),
        getFloatingProps: expect.any(Function),
        getItemProps: expect.any(Function),
        setIsOpen: expect.any(Function),
        context: expect.any(Object),
      });
    });

    test('should use default options when none provided', () => {
      const mockedUseFloating = vi.mocked(FloatingUIReact.useFloating);
      
      renderHook(() => useFloatingElement());

      expect(mockedUseFloating).toHaveBeenCalledWith(
        expect.objectContaining({
          placement: 'top',
          strategy: 'fixed',
          open: false,
        })
      );
    });

    test('should use custom options when provided', () => {
      const mockedUseFloating = vi.mocked(FloatingUIReact.useFloating);
      
      renderHook(() => useFloatingElement({
        placement: 'bottom',
        offset: 20,
        triggerAction: 'hover',
      }));

      expect(mockedUseFloating).toHaveBeenCalledWith(
        expect.objectContaining({
          placement: 'bottom',
          strategy: 'fixed',
          open: false,
        })
      );
    });

    test('should manage isOpen state correctly', () => {
      const { result } = renderHook(() => useFloatingElement());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.setIsOpen(true);
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.setIsOpen(false);
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('trigger actions', () => {
    test('should configure click interactions when triggerAction is click', () => {
      const mockedUseClick = vi.mocked(FloatingUIReact.useClick);
      const mockedUseDismiss = vi.mocked(FloatingUIReact.useDismiss);
      
      renderHook(() => useFloatingElement({ triggerAction: 'click' }));

      expect(mockedUseClick).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          enabled: true,
          toggle: true,
          keyboardHandlers: true,
        })
      );
      expect(mockedUseDismiss).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ enabled: true })
      );
    });

    test('should configure hover interactions when triggerAction is hover', () => {
      const mockedUseFocus = vi.mocked(FloatingUIReact.useFocus);
      const mockedUseHover = vi.mocked(FloatingUIReact.useHover);
      
      renderHook(() => useFloatingElement({ triggerAction: 'hover' }));

      expect(mockedUseFocus).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ enabled: true })
      );
      expect(mockedUseHover).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          enabled: true,
          restMs: 50,
          delay: expect.any(Object),
        })
      );
    });

    test('should configure focus interactions when triggerAction is focus', () => {
      const mockedUseFocus = vi.mocked(FloatingUIReact.useFocus);
      
      renderHook(() => useFloatingElement({ triggerAction: 'focus' }));

      expect(mockedUseFocus).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ enabled: true })
      );
    });
  });

  describe('keyboard interactions', () => {
    test('should handle Enter key for form-control keyboard interactions', () => {
      const { result } = renderHook(() => useFloatingElement({
        keyboardInteractions: 'form-control',
      }));

      const mockOnOpenChange = vi.mocked(FloatingUIReact.useFloating).mock.calls[0]?.[0]?.onOpenChange;

      const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      act(() => {
        mockOnOpenChange?.(true, enterKeyEvent, 'reference-press');
      });

      expect(result.current.isOpen).toBe(false);
    });

    test('should allow Enter key for default keyboard interactions', () => {
      const { result } = renderHook(() => useFloatingElement({
        keyboardInteractions: 'default',
      }));

      const mockOnOpenChange = vi.mocked(FloatingUIReact.useFloating).mock.calls[0]?.[0]?.onOpenChange;

      const enterKeyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      
      act(() => {
        mockOnOpenChange?.(true, enterKeyEvent, 'reference-press');
      });

      expect(result.current.isOpen).toBe(true);
    });

    test('should handle keyboard handlers based on keyboardInteractions setting', () => {
      const mockedUseClick = vi.mocked(FloatingUIReact.useClick);
      
      renderHook(() => useFloatingElement({
        triggerAction: 'click',
        keyboardInteractions: 'none',
      }));

      expect(mockedUseClick).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          keyboardHandlers: false,
        })
      );
    });
  });

  describe('positioning and middleware', () => {
    test('should configure offset middleware', () => {
      const mockedOffset = vi.mocked(FloatingUIReact.offset);
      
      renderHook(() => useFloatingElement({ offset: 15 }));

      expect(mockedOffset).toHaveBeenCalledWith(15);
    });

    test('should configure flip middleware with boundary', () => {
      const mockedFlip = vi.mocked(FloatingUIReact.flip);
      const boundary = document.createElement('div');
      
      renderHook(() => useFloatingElement({ boundary }));

      expect(mockedFlip).toHaveBeenCalledWith(
        expect.objectContaining({
          boundary,
          fallbackAxisSideDirection: 'end',
          crossAxis: false,
        })
      );
    });

    test('should configure shift middleware with boundary', () => {
      const mockedShift = vi.mocked(FloatingUIReact.shift);
      const mockedLimitShift = vi.mocked(FloatingUIReact.limitShift);
      const boundary = document.createElement('div');
      
      // Mock limitShift to return a proper middleware object
      const mockLimiter = {
        fn: vi.fn(),
        options: {}
      };
      mockedLimitShift.mockReturnValue(mockLimiter);
      
      renderHook(() => useFloatingElement({ boundary }));

      expect(mockedLimitShift).toHaveBeenCalledWith({ offset: 10 });
      expect(mockedShift).toHaveBeenCalledWith(
        expect.objectContaining({
          boundary,
          limiter: mockLimiter,
        })
      );
    });

    test('should configure hide middleware for hover trigger', () => {
      const mockedHide = vi.mocked(FloatingUIReact.hide);
      const boundary = document.createElement('div');
      
      renderHook(() => useFloatingElement({
        triggerAction: 'hover',
        boundary,
      }));

      expect(mockedHide).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: 'escaped',
          boundary,
        })
      );
    });

    test('should configure arrow middleware when arrowRef is provided', () => {
      const mockedArrow = vi.mocked(FloatingUIReact.arrow);
      const arrowRef = React.createRef<Element>();
      
      renderHook(() => useFloatingElement({ arrowRef: arrowRef as React.RefObject<Element> }));

      expect(mockedArrow).toHaveBeenCalledWith({ element: arrowRef });
    });

    test('should configure precise tracking when enabled', () => {
      const mockedAutoUpdate = vi.mocked(FloatingUIReact.autoUpdate);
      
      renderHook(() => useFloatingElement({ enablePreciseTracking: true }));

      const mockWhileElementsMounted = vi.mocked(FloatingUIReact.useFloating).mock.calls[0]?.[0]?.whileElementsMounted;
      const mockUpdate = vi.fn();
      const mockCleanup = vi.fn();
      mockedAutoUpdate.mockReturnValue(mockCleanup);

      const referenceEl = document.createElement('div');
      const floatingEl = document.createElement('div');
      
      const cleanup = mockWhileElementsMounted?.(referenceEl, floatingEl, mockUpdate);

      expect(mockedAutoUpdate).toHaveBeenCalledWith(
        referenceEl,
        floatingEl,
        mockUpdate,
        expect.objectContaining({
          animationFrame: true,
        })
      );
      expect(cleanup).toBe(mockCleanup);
    });
  });

  describe('role and accessibility', () => {
    test('should configure role when provided', () => {
      const mockedUseRole = vi.mocked(FloatingUIReact.useRole);
      
      renderHook(() => useFloatingElement({ role: 'tooltip' }));

      expect(mockedUseRole).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ role: 'tooltip' })
      );
    });

    test('should configure role with empty object when no role provided', () => {
      const mockedUseRole = vi.mocked(FloatingUIReact.useRole);
      
      renderHook(() => useFloatingElement());

      expect(mockedUseRole).toHaveBeenCalledWith(
        expect.any(Object),
        {}
      );
    });
  });

  describe('delay groups', () => {
    test('should use delay group when hasDelayGroup is true and trigger is hover', () => {
      const mockedUseDelayGroup = vi.mocked(FloatingUIReact.useDelayGroup);
      const mockDelay = { open: 100, close: 50 };
      const mockGroupContext = {
        delay: mockDelay,
        setCurrentId: vi.fn(),
        setState: vi.fn(), 
        initialDelay: mockDelay,
        currentId: null,
        timeoutMs: 0,
        isInstantPhase: false
      };
      mockedUseDelayGroup.mockReturnValue(mockGroupContext);
      
      renderHook(() => useFloatingElement({
        triggerAction: 'hover',
        hasDelayGroup: true,
      }));

      expect(mockedUseDelayGroup).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ enabled: true })
      );
    });

    test('should use fallback delay when hasDelayGroup is false', () => {
      const mockedUseHover = vi.mocked(FloatingUIReact.useHover);
      
      renderHook(() => useFloatingElement({
        triggerAction: 'hover',
        hasDelayGroup: false,
      }));

      expect(mockedUseHover).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          delay: { open: 500, close: 200 },
        })
      );
    });
  });

  describe('transition status', () => {
    test('should configure transition status with correct duration', () => {
      const mockedUseTransitionStatus = vi.mocked(FloatingUIReact.useTransitionStatus);
      
      renderHook(() => useFloatingElement());

      expect(mockedUseTransitionStatus).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: { open: 0, close: 500 },
        })
      );
    });
  });

  describe('additional options', () => {
    test('should pass through floatingUiOptions', () => {
      const mockedUseFloating = vi.mocked(FloatingUIReact.useFloating);
      const customOptions = { strategy: 'absolute' as const };
      
      renderHook(() => useFloatingElement({
        floatingUiOptions: customOptions,
      }));

      expect(mockedUseFloating).toHaveBeenCalledWith(
        expect.objectContaining(customOptions)
      );
    });

    test('should pass through floatingUiFlipOptions', () => {
      const mockedFlip = vi.mocked(FloatingUIReact.flip);
      const customFlipOptions = { fallbackStrategy: 'initialPlacement' as const };
      
      renderHook(() => useFloatingElement({
        floatingUiFlipOptions: customFlipOptions,
      }));

      expect(mockedFlip).toHaveBeenCalledWith(
        expect.objectContaining(customFlipOptions)
      );
    });

    test('should pass through floatingUiShiftOptions', () => {
      const mockedShift = vi.mocked(FloatingUIReact.shift);
      const customShiftOptions = { padding: 20 };
      
      renderHook(() => useFloatingElement({
        floatingUiShiftOptions: customShiftOptions,
      }));

      expect(mockedShift).toHaveBeenCalledWith(
        expect.objectContaining(customShiftOptions)
      );
    });

    test('should call additional interactions callback', () => {
      const mockedUseInteractions = vi.mocked(FloatingUIReact.useInteractions);
      const additionalInteractions = vi.fn(() => [{}]);
      
      renderHook(() => useFloatingElement({
        floatingUiInteractions: additionalInteractions,
      }));

      expect(additionalInteractions).toHaveBeenCalledWith(expect.any(Object));
      expect(mockedUseInteractions).toHaveBeenCalledWith(
        expect.arrayContaining([{}])
      );
    });
  });
});

describe('useFloatingElementArrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Create a minimal mock context for testing useFloatingElementArrow
  // We only need the specific properties that the arrow function uses
  const createMockContext = (overrides = {}) => {
    const baseContext = {
      placement: 'top',
      elements: { floating: null, reference: null },
      middlewareData: {},
    };
    
    return {
      ...baseContext,
      ...overrides,
    };
  };

  test('should return null when no floating element', () => {
    const context = createMockContext({
      elements: { floating: null, reference: null },
    });

    const { result } = renderHook(() => useFloatingElementArrow({ context: context as FloatingUIReact.FloatingContext }));

    expect(result.current).toBeNull();
  });

  test('should return arrow positioning data when floating element exists', () => {
    const floatingElement = document.createElement('div');
    const context = createMockContext();
    // Override the specific properties we need for this test
    Object.assign(context, {
      elements: { floating: floatingElement, reference: null },
      middlewareData: { arrow: { x: 10, y: 20, centerOffset: 0 } },
    });

    const { result } = renderHook(() => useFloatingElementArrow({ context: context as FloatingUIReact.FloatingContext }));

    expect(result.current).toEqual({
      side: 'bottom', // Inverted from 'top'
      arrowX: '10px',
      arrowY: '20px',
    });
  });

  test('should handle placement with alignment', () => {
    const floatingElement = document.createElement('div');
    const context = createMockContext();
    Object.assign(context, {
      placement: 'bottom-start',
      elements: { floating: floatingElement, reference: null },
      middlewareData: { arrow: { x: 15, y: 25, centerOffset: 0 } },
    });

    const { result } = renderHook(() => useFloatingElementArrow({ context: context as FloatingUIReact.FloatingContext }));

    expect(result.current).toEqual({
      side: 'top', // Inverted from 'bottom'
      arrowX: '15px',
      arrowY: '25px',
    });
  });

  test('should use staticOffset when provided', () => {
    const floatingElement = document.createElement('div');
    const context = createMockContext();
    Object.assign(context, {
      placement: 'left',
      elements: { floating: floatingElement, reference: null },
      middlewareData: { arrow: { x: 10, y: 20, centerOffset: 0 } },
    });
    const staticOffset = '50%';

    const { result } = renderHook(() => useFloatingElementArrow({
      context: context as FloatingUIReact.FloatingContext,
      staticOffset,
    }));

    expect(result.current).toEqual({
      side: 'right', // Inverted from 'left'
      arrowX: '50%',
      arrowY: '50%',
    });
  });

  test('should handle all placement sides correctly', () => {
    const floatingElement = document.createElement('div');
    const testCases = [
      { placement: 'top', expected: 'bottom' },
      { placement: 'bottom', expected: 'top' },
      { placement: 'left', expected: 'right' },
      { placement: 'right', expected: 'left' },
    ];

    testCases.forEach(({ placement, expected }) => {
      const context = createMockContext();
      Object.assign(context, {
        placement,
        elements: { floating: floatingElement, reference: null },
        middlewareData: { arrow: { x: 0, y: 0, centerOffset: 0 } },
      });

      const { result } = renderHook(() => useFloatingElementArrow({ context: context as FloatingUIReact.FloatingContext }));

      expect(result.current?.side).toBe(expected);
    });
  });

  test('should handle missing arrow data', () => {
    const floatingElement = document.createElement('div');
    const context = createMockContext();
    Object.assign(context, {
      placement: 'top',
      elements: { floating: floatingElement, reference: null },
      middlewareData: {},
    });

    const { result } = renderHook(() => useFloatingElementArrow({ context: context as FloatingUIReact.FloatingContext }));

    expect(result.current).toEqual({
      side: 'bottom',
      arrowX: undefined,
      arrowY: undefined,
    });
  });

  test('should handle non-numeric arrow coordinates', () => {
    const floatingElement = document.createElement('div');
    const context = createMockContext();
    Object.assign(context, {
      placement: 'top',
      elements: { floating: floatingElement, reference: null },
      middlewareData: { arrow: { x: 'invalid', y: null, centerOffset: 0 } },
    });

    const { result } = renderHook(() => useFloatingElementArrow({ context: context as FloatingUIReact.FloatingContext }));

    expect(result.current).toEqual({
      side: 'bottom',
      arrowX: undefined,
      arrowY: undefined,
    });
  });
});
