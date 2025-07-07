
import { classNames as cx } from '../../../util/component_util';
import { isBefore, isAfter } from 'date-fns';
import * as React from 'react';

// Components
import { DateTimePicker } from './DateTimePicker';
import { Button } from '../../buttons/Button';
import { Dropdown } from '../../overlays/dropdown/Dropdown';

import './DateTimeRangePicker.scss';


type DateTimeRangePickerProps = {
  startDateTime: Date,
  endDateTime: Date,
  onChange: (startDateTime: Date, endDateTime: Date) => void,
  toggle: React.ReactElement,
  className?: string,
};
export const DateTimeRangePicker = (props: DateTimeRangePickerProps) => {
  const { startDateTime, endDateTime, onChange, toggle, className } = props;
  
  // Use a buffer, so that we don't apply the change unless the user explicitly chooses to apply it
  const [startDateTimeBuffer, setStartDateTimeBuffer] = React.useState(startDateTime);
  const [endDateTimeBuffer, setEndDateTimeBuffer] = React.useState(endDateTime);
  
  React.useEffect(() => { setStartDateTimeBuffer(startDateTime); }, [startDateTime]);
  React.useEffect(() => { setEndDateTimeBuffer(endDateTime); }, [endDateTime]);
  
  const onChangeStartDateTime = (dateTime: Date) => {
    setStartDateTimeBuffer(dateTime);
    if (isAfter(dateTime, endDateTimeBuffer)) {
      setEndDateTimeBuffer(dateTime);
    }
  };
  
  const onChangeEndDateTime = (dateTime: Date) => {
    setEndDateTimeBuffer(dateTime);
    if (isBefore(dateTime, startDateTimeBuffer)) {
      setStartDateTimeBuffer(dateTime);
    }
  };
  
  return (
    <Dropdown primary
      className={cx('bkl-date-time-range-picker', className)}
      toggle={toggle}
    >
      {({ close }) =>
        <div className="bkl-date-time-range-picker--container">
          <div className="label-container">
            <span className="bkl-date-time-picker-label">Start date/time</span>
          </div>
          <DateTimePicker
            dateTime={startDateTimeBuffer}
            onChange={onChangeStartDateTime}
          />
          <div className="label-container">
            <span className="bkl-date-time-picker-label">End date/time</span>
          </div>
          <DateTimePicker
            dateTime={endDateTimeBuffer}
            onChange={onChangeEndDateTime}
          />
          <div className="date-range-apply-btn">
            <Button type="button"
              onClick={() => {
                onChange(startDateTimeBuffer, endDateTimeBuffer);
                close();
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      }
    </Dropdown>
  );
};
