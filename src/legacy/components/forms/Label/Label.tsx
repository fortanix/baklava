/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { classNames as cx, ComponentProps } from '../../../util/component_util.tsx';
import { Tooltip } from '../../overlays/tooltip/Tooltip.tsx';

import './Label.scss';


export type LabelProps = ComponentProps<'span'> & {
  labelValue: string,
  labelKey?: undefined | string,
  compact?: undefined | boolean,
  showTooltip?: undefined | boolean,
};
const LabelItem = (props: LabelProps) => {
  const {
    labelValue,
    labelKey = undefined,
    compact = false,
    showTooltip = false,
    ...propsRest
  } = props;
  
  const renderLabel = React.useCallback(() => {
    return (
      <>
        {labelKey &&
          <span className="bkl-label__key">
            {labelKey && labelKey.trim().length > 0 ? labelKey : <span className="bkl-label__empty">(empty)</span>}
          </span>
        }
        <span className="bkl-label__value">
          {labelValue && labelValue.trim().length > 0 ? labelValue : <span className="bkl-label__empty">(empty)</span>}
        </span>
      </>
    );
  }, [labelKey, labelValue]);
    
  return (
    <Tooltip className="bkl-label-tooltip" placement="top" content={showTooltip ? renderLabel() : ''}>
      <span
        tabIndex={showTooltip ? 0 : -1}
        {...propsRest}
        className={cx(
          'bkl-label',
          { 'bkl-label--compact': compact },
          propsRest.className,
        )}
      >
        {renderLabel()}
      </span>
    </Tooltip>
  );
};

export type LabelListProps = ComponentProps<'div'> & {
  labels: Record<string, string>,
  className?: undefined | string,
  compact?: undefined | boolean,
  showTooltip?: undefined | boolean,
};
const LabelList = (props: LabelListProps) => {
  const {
    labels,
    className = '',
    compact = false,
    showTooltip = false,
    ...propsRest
  } = props;
  
  return (
    <div
      className={cx(
        'bkl-labels-list',
        { 'bkl-labels-list--compact': compact },
        className)
      }
      {...propsRest}
    >
      {Object.entries(labels).map(([key, value]) =>
        <LabelItem key={key} labelKey={key} labelValue={value} showTooltip={showTooltip}/>,
      )}
    </div>
  );
};

export const Label = {
  Item: LabelItem,
  List: LabelList,
};
