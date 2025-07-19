/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { vi, describe, test, beforeEach, expect } from 'vitest';
import * as TL from '@testing-library/react';

import { Button } from './Button.tsx';


describe('Button', () => {
  beforeEach(TL.cleanup);
  
  test('should render a button', async () => {
    const { container, ...queries } = TL.render(
      <Button data-label="button">hello</Button>
    );
    const element = queries.getByTestId('button');
    
    await expect(element).toBeInstanceOf(HTMLButtonElement);
    await expect(element).toHaveTextContent('hello');
  });
  
  test('should accept a custom class name', () => {
    const { container, ...queries } = TL.render(
      <>
        <Button data-label="button1" className="foo">hello</Button>
        
        {/* Delete the `bkl-button` class */}
        <Button data-label="button2" className={[{ 'bkl': false, 'bkl-button': false }, 'foo']}>hello</Button>
      </>
    );
    
    const element1 = queries.getByTestId('button1');
    expect(element1).toHaveClass('bkl-button foo');
    
    const element2 = queries.getByTestId('button2');
    expect(element2).toHaveClass('foo', { exact: true });
  });
  
  test('should trigger `onClick` on click event', () => {
    const handleClick = vi.fn();
    
    const { container, ...queries } = TL.render(
      <Button data-label="button" onClick={handleClick}>hello</Button>
    );
    const element = queries.getByTestId('button');
    
    TL.fireEvent.click(element);
    
    expect(handleClick.mock.calls.length).toBe(1);
  });
  
  test('should trigger `onClick` on Enter key', () => {
    const handleClick = vi.fn();
    
    const { container, ...queries } = TL.render(
      <Button data-label="button" onClick={handleClick}>hello</Button>
    );
    const element = queries.getByTestId('button');
    
    // Trigger Enter directly on element
    TL.fireEvent.keyDown(element, { key: 'Enter', keyCode: 13 });
    expect(handleClick.mock.calls.length).toBe(1);
    handleClick.mockClear();
    
    // Focus the button and then trigger Enter on document
    TL.fireEvent.focus(element);
    element.focus(); // Just fireEvent.focus is not enough, see: https://github.com/testing-library/jest-dom/issues/53
    expect(element).toHaveFocus();
    TL.fireEvent.keyDown(container.firstChild!, { key: 'Enter', keyCode: 13 });
    expect(handleClick.mock.calls.length).toBe(1);
  });
  
  test('should accept a promise for `onClick`', async () => {
    const promises = [
      () => new Promise((resolve, reject) => setTimeout(resolve, 100)),
      () => new Promise((resolve, reject) => setTimeout(reject, 100)),
    ];
    
    for await (const makePromise of promises) {
      TL.cleanup();
      const promise = makePromise();
      
      const handleClick = vi.fn()
        .mockImplementation(() => promise);
      
      const { container, rerender, ...queries } = TL.render(
        <Button data-label="button" onClick={handleClick}>hello</Button>
      );
      const element = queries.getByTestId('button');
      
      expect(element).not.toHaveAttribute('disabled');
      
      await TL.act(async () => {
        // Trigger click event (should cause the button to become disabled until promise is resolved)
        TL.fireEvent.click(element);
        
        await TL.waitFor(() => expect(element).toHaveAttribute('disabled'));
        
        // Clicking again in this time frame should not trigger the onClick handler again (i.e. these should be ignored)
        TL.fireEvent.click(element);
        TL.fireEvent.click(element);
        TL.fireEvent.click(element);
        
        // Wait for the promise to be resolved (which is when the component will update itself). Need to wrap this
        // whole operation in `act()` so that the operation is atomic.
        try { await promise; } catch { /* Ignore */ }
        
        expect(element).not.toHaveAttribute('disabled');
      });
      
      // Click handler should only have been called once (the other clicks ignored)
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      // Now that it is no longer disabled, should be able to click again
      await TL.act(async () => {
        TL.fireEvent.click(element);
        
        // Wait for the promise to be resolved
        try { await promise; } catch { /* Ignore */ }
      });
      expect(handleClick).toHaveBeenCalledTimes(2);
    }
  });
});
