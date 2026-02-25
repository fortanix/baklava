/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { Button } from '../../actions/Button/Button.tsx';

import cl from './PropertyList.module.scss';


export { cl as PropertyListClassNames };

type PropertyProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The label of the property */
  label: React.ReactNode,

  /** The value of the property */
  value: React.ReactNode,

  /** Whether this property should take up all available space */
  fullWidth?: boolean,

  /**
   * Number of grid columns this property should span.
   * Only effective when the parent PropertyList has more than 1 column.
   */
  span?: number;

  /**
   * Enables soft multi-line clamping for string values.
   * When enabled, the text will be truncated to the specified number of lines
   * and an inline "View more / View less" toggle will be rendered if overflow occurs.
   *
   * Only applies when `value` is a string.
   */
  enableClamping?: boolean;

  /**
   * Number of visible lines before truncation occurs.
   *
   * Only effective when `enableClamping` is true.
   * Defaults to 4.
   */
  clampLines?: number;
};

export const Property = (props: PropertyProps) => {
  const {
    unstyled,
    label,
    value,
    fullWidth = false,
    span,
    enableClamping = false,
    clampLines = 4,
    style,
    ...propsRest
  } = props;

  const ddRef = React.useRef<HTMLDListElement | null>(null);
  const [processedValue, setProcessedValue] = React.useState(value);
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    /**
     * Early exit conditions:
     * - Clamping disabled
     * - Ref not ready
     * - Value is not a string (we only support string truncation)
     * - Content is currently expanded
     */
    if (
      !enableClamping ||
      !ddRef.current ||
      typeof value !== 'string' ||
      expanded
    ) {
      setProcessedValue(value);
      return;
    }

    const containerElement = ddRef.current;

    /**
     * Retrieve computed styles so our canvas measurement
     * matches the actual rendered font styles.
     */
    const computedStyles = window.getComputedStyle(containerElement);

    const fontDefinition = `${computedStyles.fontSize} ${computedStyles.fontFamily}`;

    /**
     * Available horizontal width for text rendering.
     * Used to simulate browser line wrapping.
     */
    const availableWidth = containerElement.clientWidth;

    /**
     * Controls how much of the final visible line can be filled
     * before truncation occurs.
     *
     * Example:
     * 1.0 → Fill entire line width before cutting
     * 0.8 → Cut earlier to leave space for ellipsis + toggle (View more)
     */
    const finalLineFillRatio = 0.8;
    const finalLineMaxWidth = availableWidth * finalLineFillRatio;

    /**
     * Create a temporary canvas context to measure text width.
     * This allows us to simulate how the browser wraps words.
     */
    const canvas = document.createElement('canvas');
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) return;

    canvasContext.font = fontDefinition;

    /**
     * Step 1: Simulate natural word wrapping.
     * We progressively build lines until width exceeds available space.
     */
    const words = value.split(' ');
    const wrappedLines: string[] = [];
    let currentLineBuffer = '';

    for (const word of words) {
      const candidateLine = `${currentLineBuffer}${word} `;

      if (canvasContext.measureText(candidateLine).width > availableWidth) {
        // If the word itself is wider than the container,
        // break it character-by-character
        if (canvasContext.measureText(word).width > availableWidth) {
          let brokenWord = '';

          for (const char of word) {
            const testCharLine = `${currentLineBuffer}${brokenWord}${char}`;

            if (canvasContext.measureText(testCharLine).width > availableWidth) {
              wrappedLines.push((currentLineBuffer + brokenWord).trim());
              currentLineBuffer = char;
              brokenWord = '';
            } else {
              brokenWord += char;
            }
          }

          currentLineBuffer += `${brokenWord} `;
        } else {
          wrappedLines.push(currentLineBuffer.trim());
          currentLineBuffer = `${word} `;
        }
      } else {
        currentLineBuffer = candidateLine;
      }
    }

    wrappedLines.push(currentLineBuffer.trim());

    /**
     * Step 2: If total wrapped lines exceed allowed clamp lines,
     * truncate the final visible line dynamically.
     */
    if (wrappedLines.length > clampLines) {
      const truncateLineIndex = clampLines - 1;

      let truncatedLineBuffer = '';
      const wordsInTargetLine =
        wrappedLines[truncateLineIndex]?.split(' ') ?? [];

      /**
       * Build the final visible line word-by-word until
       * it exceeds the allowed width (including ellipsis).
       */
      for (const word of wordsInTargetLine) {
        const candidateLine = `${truncatedLineBuffer}${word} `;

        if (
          canvasContext.measureText(`${candidateLine}...`).width >
          finalLineMaxWidth
        ) {
          break;
        }

        truncatedLineBuffer = candidateLine;
      }

      /**
       * Combine fully visible lines with truncated final line.
       */
      const truncatedOutput = [
        ...wrappedLines.slice(0, truncateLineIndex),
        `${truncatedLineBuffer.trim()}...`,
      ];

      setProcessedValue(truncatedOutput.join('\n'));
    } else {
      /**
       * Content fits within clamp limit — no truncation needed.
       */
      setProcessedValue(wrappedLines.join('\n'));
    }
  }, [value, enableClamping, clampLines, expanded]);


  // Note: HTML allows wrapping dt/dd pairs in a `<div>`:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl#wrapping_name-value_groups_in_div_elements
  return (
    <div
      {...propsRest}
      className={cx({
        [cl['bk-property-list__property']]: !unstyled,
      }, propsRest.className)}
      style={{
        gridColumn: fullWidth
          ? '1 / -1'
          : span
            ? `span ${span}`
            : undefined,
        ...style,
      }}
    >
      <dt>{label}</dt>
      <dd ref={ddRef}>
        {enableClamping && !expanded ? processedValue : value}
        {enableClamping && (
          <>
            {' '}
            <Button
              onPress={() => setExpanded((p) => !p)}
              className={cx(cl['bk-property-list__property__view-more'])}
              unstyled
            >
              {expanded ? 'View less' : 'View more'}
            </Button>
          </>
        )}
      </dd>
    </div>
  );
};

export type PropertyListProps = React.PropsWithChildren<ComponentProps<'dl'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,
  columns?: number | string
}>;
export const PropertyList = Object.assign(
  ({ unstyled = false, columns = 1, style, ...propsRest }: PropertyListProps) => {
    return (
      <dl
        {...propsRest}
        style={{
          '--bk-property-columns': columns,
          ...style,
        }}
        className={cx({
          bk: true,
          [cl['bk-property-list']]: !unstyled,
        }, propsRest.className)}
      />
    );
  },
  { Property },
);
