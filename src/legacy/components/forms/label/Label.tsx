
import * as React from 'react';
import { classNames as cx, ComponentPropsWithoutRef } from '../../../util/component_util';
import Tooltip from '../../overlays/tooltip/Tooltip';

import './Label.scss';


export type LabelProps = ComponentPropsWithoutRef<'span'> & {
  labelValue: string,
  labelKey?: string,
  className?: string,
  compact?: boolean,
  dark?: boolean,
  showTooltip?: boolean,
};
const LabelItem = (props: LabelProps): React.ReactElement => {
  const {
    labelValue,
    labelKey = undefined,
    className = '',
    compact = false,
    dark = false,
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
        className={cx(
          'bkl-label',
          { 'bkl-label--compact': compact },
          { 'bkl-label--dark': dark },
          className)
        }
        {...propsRest}
      >
        {renderLabel()}
      </span>
    </Tooltip>
  );
};
LabelItem.displayName = 'LabelItem';

export type LabelListProps = ComponentPropsWithoutRef<'div'> & {
  labels: Record<string, string>,
  className?: string,
  compact?: boolean,
  dark?: boolean,
  showTooltip?: boolean,
};
const LabelList = (props: LabelListProps): React.ReactElement => {
  const {
    labels,
    className = '',
    compact = false,
    dark = false,
    showTooltip = false,
    ...restProps
  } = props;

  return (
    <div
      className={cx(
        'bkl-labels-list',
        { 'bkl-labels-list--compact': compact },
        { 'bkl-labels-list--dark': dark },
        className)
      }
      {...restProps}
    >
      {Object.entries(labels).map(([key, value]) =>
        <LabelItem key={key} labelKey={key} labelValue={value} showTooltip={showTooltip} />,
      )}
    </div>
  );
};
LabelList.displayName = 'LabelList';


export const Label = {
  Item: LabelItem,
  List: LabelList,
};
  
export default Label;
