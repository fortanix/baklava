/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Source: https://github.com/idanen/react-draggable
 */

import * as React from 'react';


type Limits = { minX: number, maxX: number, minY: number, maxY: number };
type CalcDeltaArgs = {
  x: number,
  y: number,
  limits?: undefined | Limits,
};
const calcDelta = ({ x, y, limits }: CalcDeltaArgs) => {
  if (!limits) {
    return { x, y };
  }
  
  const { minX, maxX, minY, maxY } = limits;
  
  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
};

export type UseDraggableProps = {
  controlStyle?: boolean,
  viewport?: boolean,
  rectLimits?: { left: number, right: number, top: number, bottom: number },
};
export type UseDraggableResult = {
  targetRef: any,
  handleRef: any,
  getTargetProps: any,
  dragging: any,
  delta: any,
  resetState: any,
};
export const useDraggable = (props: UseDraggableProps) => {
  const {
    controlStyle = true,
    viewport = false,
    rectLimits,
  } = props;
  
  const targetRef = React.useRef<HTMLElement>(null);
  const handleRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const [prev, setPrev] = React.useState({ x: 0, y: 0 });
  const [delta, setDelta] = React.useState({ x: 0, y: 0 });
  const initial = React.useRef({ x: 0, y: 0 });
  const limits = React.useRef<Limits>();
  
  const stopDragging = (event: MouseEvent | TouchEvent) => {
    event.preventDefault();
    setDragging(false);
    const newDelta = reposition(event);
    setPrev(newDelta);
    if (controlStyle && targetRef.current) {
      targetRef.current.style.willChange = '';
    }
  };
  
  const reposition = (event: MouseEvent | TouchEvent) => {
    const source =
      ('changedTouches' in event && event.changedTouches[0])
      || ('touches' in event && event.touches[0])
      || event;
    const clientX = 'clientX' in source ? source.clientX : 0;
    const clientY = 'clientY' in source ? source.clientY : 0;
    const x = clientX - initial.current.x + prev.x;
    const y = clientY - initial.current.y + prev.y;
    
    const newDelta = calcDelta({ x, y, limits: limits.current });
    setDelta(newDelta);
    
    return newDelta;
  };
  
  React.useEffect(() => {
    const startDragging = (event: MouseEvent | TouchEvent): void => {
      event.preventDefault();
      setDragging(true);
      const source = ('touches' in event && event.touches[0]) || event;
      const clientX = 'clientX' in source ? source.clientX : 0;
      const clientY = 'clientY' in source ? source.clientY : 0;
      initial.current = { x: clientX, y: clientY };
      
      const target = targetRef.current;
      if (!target) { return; }
      
      if (controlStyle) {
        targetRef.current.style.willChange = 'transform';
      }
      if (viewport || rectLimits) {
        const {
          left,
          top,
          width,
          height
        } = targetRef.current.getBoundingClientRect();
        
        if (viewport) {
          limits.current = {
            minX: -left + delta.x,
            maxX: window.innerWidth - width - left + delta.x,
            minY: -top + delta.y,
            maxY: window.innerHeight - height - top + delta.y
          };
        } else if (rectLimits) {
          limits.current = {
            minX: rectLimits.left - left + delta.x,
            maxX: rectLimits.right - width - left + delta.x,
            minY: rectLimits.top - top + delta.y,
            maxY: rectLimits.bottom - height - top + delta.y
          };
        }
      }
    };
    
    const handle = handleRef.current || targetRef.current;
    handle?.addEventListener('mousedown', startDragging);
    handle?.addEventListener('touchstart', startDragging);
    
    return () => {
      handle?.removeEventListener('mousedown', startDragging);
      handle?.removeEventListener('touchstart', startDragging);
    };
  }, [controlStyle, viewport, delta, rectLimits]);
  
  React.useEffect(() => {
    const handle = handleRef.current || targetRef.current;
    if (dragging) {
      document.addEventListener('mousemove', reposition, { passive: true });
      document.addEventListener('touchmove', reposition, { passive: true });
      document.addEventListener('mouseup', stopDragging);
      document.addEventListener('touchend', stopDragging);
    } else {
      document.removeEventListener('mousemove', reposition);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchmove', reposition);
      document.removeEventListener('touchend', stopDragging);
    }
    
    if (controlStyle && handle) {
      handle.style.cursor = dragging ? 'grabbing' : 'grab';
    }
    
    return () => {
      if (controlStyle && handle) {
        handle.style.cursor = '';
      }
      document.removeEventListener('mousemove', reposition);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchmove', reposition);
      document.removeEventListener('touchend', stopDragging);
    };
  }, [dragging, prev, controlStyle, viewport, rectLimits]);
  
  React.useEffect(() => {
    if (controlStyle && targetRef.current) {
      targetRef.current.style.transform = `translate(${delta.x}px, ${delta.y}px)`;
    }
  }, [delta, controlStyle]);
  
  const getTargetProps = React.useCallback(
    () => ({
      'aria-grabbed': dragging || null,
    }),
    [dragging],
  );
  
  const resetState = React.useCallback(() => {
    setDelta({ x: 0, y: 0 });
    setPrev({ x: 0, y: 0 });
  }, [setDelta, setPrev]);
  
  return { targetRef, handleRef, getTargetProps, dragging, delta, resetState };
}

export type DraggableProps = {
  children: (result: UseDraggableResult) => React.ReactNode,
};
export const Draggable = ({ children, ...rest }: DraggableProps) => {
  return children(useDraggable(rest));
};
