/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { classNames as cx, type ComponentProps } from '../../../util/componentUtil.ts';
import * as React from 'react';

import { ButtonAsLink } from '../../actions/ButtonAsLink/ButtonAsLink.tsx';

import cl from './Property.module.scss';

export type PropertySize = 'small' | 'medium' | 'large' | 'full-size';

type PropertyProps = ComponentProps<'div'> & {
  /** Whether this component should be unstyled. */
  unstyled?: undefined | boolean,

  /** The label of the property */
  label: null | React.ReactNode,

  /** The value of the property */
  value: null | React.ReactNode,

  /** 
   * Size of the property 
   * 
   * * Defaults to `small`.
  */
  size?: undefined | PropertySize

  /**
   * Enables multi-line clamping for string values.
   * When enabled, the text will be truncated to the specified number of lines
   * and an "View more / View less" toggle will be rendered to next line if overflow occurs.
   *
   * Only applies when `value` is a string.
   * Defaults to false.
   */
  expandable?: undefined | boolean,
  /**
   * Number of visible lines before truncation occurs.
   *
   * Only effective when `expandable` is true.
   * Defaults to 4.
   */
  clampLines?: undefined | number,
};

export const Property = (props: PropertyProps) => {
  const {
    unstyled,
    label,
    value,
    size = 'small',
    expandable = false,
    clampLines = 4,
    style,
    ...propsRest
  } = props;

  const [toggleExpanded, setToggleExpanded] = React.useState(false);

  const isStringValue = typeof value === 'string';

  const shouldClamp = expandable && isStringValue && !toggleExpanded;

  // Note: HTML allows wrapping dt/dd pairs in a `<div>`:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl#wrapping_name-value_groups_in_div_elements
  return (
    <div
      {...propsRest}
      className={cx(
        {
          [cl['bk-property']]: !unstyled,
          [cl['bk-property--small']]: size === 'small',
          [cl['bk-property--medium']]: size === 'medium',
          [cl['bk-property--large']]: size === 'large',
          [cl['bk-property--full-size']]: size === 'full-size',
        },
        propsRest.className,
      )}
      style={style}
    >
      <dt>{label}</dt>

      <dd>
        {/* Text wrapper (ONLY value gets clamped) */}
        <div
          className={cx(
            cl['bk-property__value'],
            {
              [cl['bk-property__value--clamped']]: shouldClamp,
            },
          )}
          style={shouldClamp ? { WebkitLineClamp: clampLines } : undefined}
        >
          {value}
        </div>

        {expandable && isStringValue && (
          <ButtonAsLink
            onPress={() => { setToggleExpanded(prev => !prev); }}
            className={cl['bk-property__toggle-expand']}
          >
            {toggleExpanded ? 'View less' : 'View more'}
          </ButtonAsLink>
        )}
      </dd>
    </div>
  );
};
