
import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react';

import { type OpenChangeEvent, type PopoverController, type UsePopoverOptions, usePopover } from './usePopover.ts';


//
// Fake Popover API
// jsdom implements neither `togglePopover()` nor the `:popover-open` pseudo-class, so we provide a minimal fake that
// tracks the open state per element. Note: `function` expressions are used for the fakes below since they need `this`.
// See: https://github.com/jsdom/jsdom/issues/3721
//

type ToggleOptions = { force?: boolean, source?: HTMLElement };

let openPopovers = new WeakSet<Element>();
let shouldThrow = false;
const togglePopoverSpy = vi.fn();

const installPopoverApi = () => {
  openPopovers = new WeakSet<Element>();
  shouldThrow = false;
  togglePopoverSpy.mockClear();
  
  const originalMatches = Element.prototype.matches;
  vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
    return selector === ':popover-open' ? openPopovers.has(this) : originalMatches.call(this, selector);
  });
  
  Object.defineProperty(HTMLElement.prototype, 'togglePopover', {
    configurable: true,
    writable: true,
    value: function (this: HTMLElement, options?: ToggleOptions) {
      togglePopoverSpy(options);
      if (shouldThrow) { throw new Error('togglePopover failed'); }
      const open = options?.force ?? !openPopovers.has(this);
      if (open) { openPopovers.add(this); } else { openPopovers.delete(this); }
      return open;
    },
  });
};

const uninstallPopoverApi = () => {
  Reflect.deleteProperty(HTMLElement.prototype, 'togglePopover');
};


//
// Helpers
//

type TestPopoverProps = {
  controller: PopoverController,
  options?: UsePopoverOptions<HTMLDivElement>,
};
const TestPopover = ({ controller, options }: TestPopoverProps) => {
  const { popoverProps } = usePopover<HTMLDivElement>(controller, options);
  return (
    <div data-label="popover" {...popoverProps}>
      <span data-label="child">Content</span>
    </div>
  );
};

const getPopover = () => screen.getByTestId('popover');
const isOpen = () => openPopovers.has(getPopover());

const createSource = (): HTMLButtonElement => {
  const button = document.createElement('button');
  document.body.appendChild(button);
  return button;
};

// Dispatch a `toggle` event the way the browser would (jsdom has no `ToggleEvent`)
const fireToggle = (target: Element, newState: 'open' | 'closed', init: EventInit = {}) => {
  const event = Object.assign(new Event('toggle', init), {
    newState,
    oldState: newState === 'open' ? 'closed' : 'open',
  });
  fireEvent(target, event);
};


describe('usePopover', () => {
  beforeEach(() => {
    installPopoverApi();
  });
  
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    uninstallPopoverApi();
    document.body.innerHTML = '';
  });
  
  describe('popoverProps', () => {
    it('defaults `popover` behavior to "auto"', () => {
      render(<TestPopover controller={{ defaultOpen: false }} />);
      expect(getPopover().getAttribute('popover')).toBe('auto');
    });
    
    it('respects a custom `popoverBehavior`', () => {
      render(<TestPopover controller={{ defaultOpen: false }} options={{ popoverBehavior: 'manual' }} />);
      expect(getPopover().getAttribute('popover')).toBe('manual');
    });
    
    it('keeps the ref callback stable while its dependencies are unchanged', () => {
      const controller: PopoverController = { open: false, onOpenChange: vi.fn() };
      const { result, rerender } = renderHook(() => usePopover(controller));
      const firstRef = result.current.popoverProps.ref;
      rerender();
      expect(result.current.popoverProps.ref).toBe(firstRef);
    });
    
    it('creates a new ref callback when `open` changes', () => {
      const onOpenChange = vi.fn();
      const { result, rerender } = renderHook(
        ({ open }: { open: boolean }) => usePopover({ open, onOpenChange }),
        { initialProps: { open: false } },
      );
      const firstRef = result.current.popoverProps.ref;
      rerender({ open: true });
      expect(result.current.popoverProps.ref).not.toBe(firstRef);
    });
  });
  
  describe('uncontrolled', () => {
    it('stays closed by default', () => {
      render(<TestPopover controller={{}} />);
      expect(togglePopoverSpy).not.toHaveBeenCalled();
      expect(isOpen()).toBe(false);
    });
    
    it('opens on mount when `defaultOpen` is `true`', () => {
      render(<TestPopover controller={{ defaultOpen: true }} />);
      expect(togglePopoverSpy).toHaveBeenCalledTimes(1);
      expect(togglePopoverSpy).toHaveBeenCalledWith({ force: true });
      expect(isOpen()).toBe(true);
    });
    
    it('only applies `defaultOpen` once', () => {
      const { rerender } = render(<TestPopover controller={{ defaultOpen: true }} />);
      expect(togglePopoverSpy).toHaveBeenCalledTimes(1);
      
      rerender(<TestPopover controller={{ defaultOpen: false }} />);
      expect(togglePopoverSpy).toHaveBeenCalledTimes(1);
      expect(isOpen()).toBe(true);
    });
    
    it('does not re-open after the user dismissed it', () => {
      const sourceA = createSource();
      const sourceB = createSource();
      const { rerender } = render(<TestPopover controller={{ defaultOpen: true, source: sourceA }} />);
      expect(isOpen()).toBe(true);
      
      // Simulate a light dismiss, then force the ref callback to run again by changing one of its dependencies
      openPopovers.delete(getPopover());
      rerender(<TestPopover controller={{ defaultOpen: true, source: sourceB }} />);
      
      expect(togglePopoverSpy).toHaveBeenCalledTimes(1);
      expect(isOpen()).toBe(false);
    });
  });
  
  describe('controlled', () => {
    it('opens on mount when `open` is `true`', () => {
      render(<TestPopover controller={{ open: true, onOpenChange: vi.fn() }} />);
      expect(togglePopoverSpy).toHaveBeenCalledTimes(1);
      expect(togglePopoverSpy).toHaveBeenCalledWith({ force: true });
      expect(isOpen()).toBe(true);
    });
    
    it('does nothing on mount when `open` is `false`', () => {
      render(<TestPopover controller={{ open: false, onOpenChange: vi.fn() }} />);
      expect(togglePopoverSpy).not.toHaveBeenCalled();
      expect(isOpen()).toBe(false);
    });
    
    it('opens when `open` changes from `false` to `true`', () => {
      const onOpenChange = vi.fn();
      const { rerender } = render(<TestPopover controller={{ open: false, onOpenChange }} />);
      rerender(<TestPopover controller={{ open: true, onOpenChange }} />);
      
      expect(togglePopoverSpy).toHaveBeenCalledTimes(1);
      expect(togglePopoverSpy).toHaveBeenLastCalledWith({ force: true });
      expect(isOpen()).toBe(true);
    });
    
    it('closes when `open` changes from `true` to `false`', () => {
      const onOpenChange = vi.fn();
      const { rerender } = render(<TestPopover controller={{ open: true, onOpenChange }} />);
      rerender(<TestPopover controller={{ open: false, onOpenChange }} />);
      
      expect(togglePopoverSpy).toHaveBeenCalledTimes(2);
      expect(togglePopoverSpy).toHaveBeenLastCalledWith({ force: false });
      expect(isOpen()).toBe(false);
    });
    
    it('does not call `togglePopover` when the DOM state already matches', () => {
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <TestPopover controller={{ open: true, onOpenChange, source: createSource() }} />,
      );
      expect(togglePopoverSpy).toHaveBeenCalledTimes(1);
      
      // Changing `source` forces the ref callback to run again, but the popover is already open
      rerender(<TestPopover controller={{ open: true, onOpenChange, source: createSource() }} />);
      expect(togglePopoverSpy).toHaveBeenCalledTimes(1);
    });
    
    it('re-applies the controlled state if the DOM state drifted', () => {
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <TestPopover controller={{ open: true, onOpenChange, source: createSource() }} />,
      );
      
      openPopovers.delete(getPopover()); // DOM closed behind React's back
      rerender(<TestPopover controller={{ open: true, onOpenChange, source: createSource() }} />);
      
      expect(togglePopoverSpy).toHaveBeenCalledTimes(2);
      expect(isOpen()).toBe(true);
    });
  });
  
  describe('source element', () => {
    it('passes a connected `HTMLElement` source to `togglePopover`', () => {
      const source = createSource();
      render(<TestPopover controller={{ open: true, onOpenChange: vi.fn(), source }} />);
      expect(togglePopoverSpy).toHaveBeenCalledWith({ force: true, source });
    });
    
    it('passes the source when closing as well', () => {
      const source = createSource();
      const onOpenChange = vi.fn();
      const { rerender } = render(<TestPopover controller={{ open: true, onOpenChange, source }} />);
      rerender(<TestPopover controller={{ open: false, onOpenChange, source }} />);
      expect(togglePopoverSpy).toHaveBeenLastCalledWith({ force: false, source });
    });
    
    it('omits the source if it is `null`', () => {
      render(<TestPopover controller={{ open: true, onOpenChange: vi.fn(), source: null }} />);
      expect(togglePopoverSpy.mock.calls[0]?.[0]).toStrictEqual({ force: true });
    });
    
    it('omits the source if it is not connected to the DOM', () => {
      const source = document.createElement('button'); // Never appended
      render(<TestPopover controller={{ open: true, onOpenChange: vi.fn(), source }} />);
      expect(togglePopoverSpy.mock.calls[0]?.[0]).toStrictEqual({ force: true });
    });
    
    it('omits the source if it is not an `HTMLElement` (e.g. an `<svg>`)', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      document.body.appendChild(svg);
      render(
        <TestPopover controller={{ open: true, onOpenChange: vi.fn(), source: svg as unknown as HTMLElement }} />,
      );
      expect(togglePopoverSpy.mock.calls[0]?.[0]).toStrictEqual({ force: true });
    });
  });
  
  describe('ref callback edge cases', () => {
    it('does nothing when called with `null`', () => {
      const { result } = renderHook(() => usePopover({ open: true, onOpenChange: vi.fn() }));
      const ref = result.current.popoverProps.ref as React.RefCallback<HTMLElement>;
      ref(null);
      expect(togglePopoverSpy).not.toHaveBeenCalled();
    });
    
    it('does not sync an element that is not connected', () => {
      const { result } = renderHook(() => usePopover({ open: true, onOpenChange: vi.fn() }));
      const ref = result.current.popoverProps.ref as React.RefCallback<HTMLElement>;
      ref(document.createElement('div')); // Never appended
      expect(togglePopoverSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('error handling', () => {
    it('logs an error instead of throwing when opening fails', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      shouldThrow = true;
      
      expect(() => {
        render(<TestPopover controller={{ open: true, onOpenChange: vi.fn() }} />);
      }).not.toThrow();
      
      expect(consoleError).toHaveBeenCalledWith('Unable to open popover', expect.any(Error));
    });
    
    it('logs an error instead of throwing when closing fails', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onOpenChange = vi.fn();
      const { rerender } = render(<TestPopover controller={{ open: true, onOpenChange }} />);
      expect(isOpen()).toBe(true);
      
      shouldThrow = true;
      expect(() => {
        rerender(<TestPopover controller={{ open: false, onOpenChange }} />);
      }).not.toThrow();
      
      expect(consoleError).toHaveBeenCalledWith('Failed to close popover', expect.any(Error));
    });
  });
  
  describe('controlled usage warning', () => {
    it('warns when `open` is set without `onOpenChange`', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<TestPopover controller={{ open: true }} />);
      expect(consoleWarn).toHaveBeenCalledWith('Missing `onOpenChange` in controlled `usePopover()` usage');
    });
    
    it('does not warn when `open` is set together with `onOpenChange`', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<TestPopover controller={{ open: true, onOpenChange: vi.fn() }} />);
      expect(consoleWarn).not.toHaveBeenCalled();
    });
    
    it('does not warn for uncontrolled usage', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<TestPopover controller={{ defaultOpen: true }} />);
      expect(consoleWarn).not.toHaveBeenCalled();
    });
  });
  
  describe('toggle events', () => {
    it('reports a forced `open: true` change when the popover opens', () => {
      const onOpenChange = vi.fn<(event: OpenChangeEvent) => void>();
      render(<TestPopover controller={{ open: false, onOpenChange }} />);
      
      fireToggle(getPopover(), 'open');
      
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith({ open: true, forced: true });
    });
    
    it('reports a forced `open: false` change when the popover closes', () => {
      const onOpenChange = vi.fn<(event: OpenChangeEvent) => void>();
      render(<TestPopover controller={{ open: true, onOpenChange }} />);
      
      fireToggle(getPopover(), 'closed');
      
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith({ open: false, forced: true });
    });
    
    it('also reports toggle events for uncontrolled popovers', () => {
      const onOpenChange = vi.fn<(event: OpenChangeEvent) => void>();
      render(<TestPopover controller={{ defaultOpen: true, onOpenChange }} />);
      
      fireToggle(getPopover(), 'closed');
      
      expect(onOpenChange).toHaveBeenCalledWith({ open: false, forced: true });
    });
    
    it('ignores toggle events that originate from a nested element', () => {
      const onOpenChange = vi.fn();
      render(<TestPopover controller={{ open: true, onOpenChange }} />);
      
      // Native `toggle` events don't bubble, but nested popovers may still end up triggering the handler
      fireToggle(screen.getByTestId('child'), 'closed', { bubbles: true });
      
      expect(onOpenChange).not.toHaveBeenCalled();
    });
    
    it('does not throw when there is no `onOpenChange` handler', () => {
      render(<TestPopover controller={{ defaultOpen: true }} />);
      expect(() => fireToggle(getPopover(), 'closed')).not.toThrow();
    });
    
    it('always calls the latest `onOpenChange`', () => {
      const first = vi.fn();
      const second = vi.fn();
      const { rerender } = render(<TestPopover controller={{ open: false, onOpenChange: first }} />);
      rerender(<TestPopover controller={{ open: false, onOpenChange: second }} />);
      
      fireToggle(getPopover(), 'open');
      
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith({ open: true, forced: true });
    });
  });
});
