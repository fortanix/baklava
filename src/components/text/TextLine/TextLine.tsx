/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';

import { TooltipProvider } from '../../overlays/Tooltip/TooltipProvider.tsx';

import cl from './TextLine.module.scss';


export { cl as TextLineClassNames };

export type TextLineProps = ComponentProps<'span'> & {
  /** Whether to show a tooltip with the full text content in case of overflow. Default: true. */
  showOverflowTooltip?: undefined | boolean,
};
/**
 * A single-line piece of text.
 */
export const TextLine = (props: TextLineProps) => {
  const { showOverflowTooltip = true, ...propsRest } = props;
  
  const elementRef = React.useRef<null | HTMLSpanElement>(null);
  
  const renderTooltip = React.useCallback(() => {
    const element = elementRef.current;
    if (!element) { return; }
    
    const hasOverflow = element.scrollWidth > element.clientWidth;
    return hasOverflow ? (element.innerText ?? null) : null;
  }, []);
  
  const text = (
    <span
      ref={elementRef}
      {...propsRest}
      className={cx(
        'bk',
        cl['bk-text-line'],
        propsRest.className,
      )}
    />
  );
  
  if (showOverflowTooltip) {
    return (
      <TooltipProvider tooltip={renderTooltip}>
        {text}
      </TooltipProvider>
    );
  }
  
  return text;
};
