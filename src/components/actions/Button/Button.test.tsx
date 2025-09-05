/* Copyright (c) Fortanix, Inc.
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
 * the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ErrorBoundary } from 'react-error-boundary';

import { Button, internalSubmitSymbol } from './Button.tsx';
import cl from './Button.module.scss';


describe('Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('should render with default props', () => {
    render(<Button label="Test Button" />);
    
    const button = screen.getByRole('button', { name: 'Test Button' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('bk', cl['bk-button'], cl['bk-button--tertiary']);
  });
  
  test('should render children when provided', () => {
    render(<Button>Custom Content</Button>);
    
    const button = screen.getByRole('button', { name: 'Custom Content' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Custom Content');
  });
  
  test('should use label as aria-label when both children and label are provided', () => {
    render(<Button label="Accessible Name">Visible Content</Button>);
    
    const button = screen.getByRole('button', { name: 'Accessible Name' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Visible Content');
    expect(button).toHaveAttribute('aria-label', 'Accessible Name');
  });
  
  describe('kinds', () => {
    test('should apply primary kind class', () => {
      render(<Button kind="primary" label="Primary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(cl['bk-button--primary']);
      expect(button).not.toHaveClass(cl['bk-button--secondary'], cl['bk-button--tertiary']);
    });
    
    test('should apply secondary kind class', () => {
      render(<Button kind="secondary" label="Secondary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(cl['bk-button--secondary']);
      expect(button).not.toHaveClass(cl['bk-button--primary'], cl['bk-button--tertiary']);
    });
    
    test('should apply tertiary kind class by default', () => {
      render(<Button label="Tertiary" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(cl['bk-button--tertiary']);
      expect(button).not.toHaveClass(cl['bk-button--primary'], cl['bk-button--secondary']);
    });
  });
  
  describe('variants', () => {
    test('should apply normal variant by default', () => {
      render(<Button label="Normal" />);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass(cl['bk-button--card']);
    });
    
    test('should apply card variant class', () => {
      render(<Button variant="card" label="Card" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(cl['bk-button--card']);
    });
  });
  
  describe('disabled state', () => {
    test('should be disabled when disabled prop is true', () => {
      render(<Button disabled label="Disabled" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveClass(cl['bk-button--disabled']);
    });
    
    test('should not call onPress when disabled', async () => {
      const onPress = vi.fn();
      const user = userEvent.setup();
      
      render(<Button disabled onPress={onPress} label="Disabled" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onPress).not.toHaveBeenCalled();
    });
  });
  
  describe('nonactive state', () => {
    test('should have nonactive styling when nonactive prop is true', () => {
      render(<Button nonactive label="Nonactive" />);
      
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled(); // Should still be focusable
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveClass(cl['bk-button--nonactive'], 'nonactive');
    });
    
    test('should not call onPress when nonactive', async () => {
      const onPress = vi.fn();
      const user = userEvent.setup();
      
      render(<Button nonactive onPress={onPress} label="Nonactive" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onPress).not.toHaveBeenCalled();
    });
  });
  
  describe('unstyled prop', () => {
    test('should not apply default styling when unstyled is true', () => {
      render(<Button unstyled label="Unstyled" />);
      
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass(cl['bk-button']);
      expect(button).toHaveClass('bk'); // Should still have the bk class
    });
  });
  
  describe('trimmed prop', () => {
    test('should apply trimmed class when trimmed is true', () => {
      render(<Button trimmed label="Trimmed" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass(cl['bk-button--trimmed']);
    });
  });
  
  describe('icon prop', () => {
    test('should render icon when icon prop is provided', () => {
      render(<Button icon="home" label="With Icon" />);
      
      const button = screen.getByRole('button');
      const svgElement = button.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });
  
  describe('onPress event handling', () => {
    test('should call onPress when clicked', async () => {
      const onPress = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onPress={onPress} label="Clickable" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onPress).toHaveBeenCalledTimes(1);
    });
    
    test('should call both onClick and onPress when both are provided', async () => {
      const onClick = vi.fn();
      const onPress = vi.fn();
      const user = userEvent.setup();
      
      render(<Button onClick={onClick} onPress={onPress} label="Both Handlers" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
    
    test('should preventDefault when onPress is provided', async () => {
      const onPress = vi.fn();
      
      render(<Button onPress={onPress} label="Prevent Default" />);
      
      const button = screen.getByRole('button');
      const event = new MouseEvent('click', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
      
      fireEvent(button, event);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });
  
  describe('async onPress handling', () => {
    test('should show spinner during async onPress', async () => {
      const asyncOnPress = vi.fn().mockImplementation(() => new Promise(resolve => {
        setTimeout(resolve, 100);
      }));
      const user = userEvent.setup();
      
      render(<Button onPress={asyncOnPress} label="Async Button" />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // Should show spinner and be in nonactive state during async operation
      expect(button).toHaveClass(cl['bk-button--nonactive'], 'nonactive');
      
      // Wait for the async operation to complete
      await waitFor(() => {
        expect(button).not.toHaveClass(cl['bk-button--nonactive'], 'nonactive');
      });
    });
    
    test('should handle async timeout', async () => {
      // Mock console.error to prevent timeout error from appearing in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const slowAsyncOnPress = vi.fn().mockImplementation(() => new Promise(resolve => {
        setTimeout(resolve, 100); // Longer than asyncTimeout
      }));
      const user = userEvent.setup();
      
      render(
        <ErrorBoundary
          FallbackComponent={() => <div>Error</div>}
        >
          <Button onPress={slowAsyncOnPress} asyncTimeout={50} label="Slow Async" />);
        </ErrorBoundary>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      // Button should initially be in nonactive state
      expect(button).toHaveClass(cl['bk-button--nonactive']);
      
      // Should timeout and return to normal state
      await waitFor(() => {
        expect(button).not.toBeVisible();
        expect(screen.getByText('Error')).toBeVisible();
      }, { timeout: 200 });
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('type attribute', () => {
    test('should throw error when type="submit" is provided', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<Button {...{ type: 'submit' }} label="Submit" />);
      }).toThrow('Button component cannot have type \'submit\', use SubmitButton instead.');
      
      consoleSpy.mockRestore();
    });
    
    test('should allow internal submit symbol', () => {
      render(<Button {...{ type: internalSubmitSymbol }} label="Internal Submit" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });
  
  describe('custom props', () => {
    test('should pass through additional HTML attributes', () => {
      render(<Button data-testid="custom-button" title="Custom Title" label="Custom" />);
      
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('title', 'Custom Title');
    });
    
    test('should merge custom className with default classes', () => {
      render(<Button className="custom-class" label="Custom Class" />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bk', cl['bk-button'], 'custom-class');
    });
  });
  
  describe('accessibility', () => {
    test('should be focusable by default', () => {
      render(<Button label="Focusable" />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
    
    test('should not be focusable when disabled', () => {
      render(<Button disabled label="Not Focusable" />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).not.toHaveFocus();
    });
    
    test('should be focusable when nonactive', () => {
      render(<Button nonactive label="Still Focusable" />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });
});
