/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { format, startOfMonth, lastDayOfMonth, set } from 'date-fns';

import * as React from 'react';
import { classNames as cx, type ComponentProps } from '../../../util/component_util.tsx';

import { IconDecorated as Icon } from '../../icons/IconDecorated.tsx';
import { Button } from '../../buttons/Button.tsx';
import { SwitcherButtons } from '../../navigation/Switcher/Switcher.tsx';
import { Dropdown } from '../../overlays/dropdown/Dropdown.tsx';

import './YearMonthPicker.scss';


// starting the index from 0 to match 'new Date().getMonth()'
const monthInfo = {
  0: { label: 'January' },
  1: { label: 'February' },
  2: { label: 'March' },
  3: { label: 'April' },
  4: { label: 'May' },
  5: { label: 'June' },
  6: { label: 'July' },
  7: { label: 'August' },
  8: { label: 'September' },
  9: { label: 'October' },
  10: { label: 'November' },
  11: { label: 'December' },
} as const;

type Month = keyof typeof monthInfo;
type Year = number;

export type YearMonthPickerMode = 'previous' | 'current' | 'select' | 'none';

export type YearMonthPickerBuffer = { month: Month, year: Year };

export type YearMonthPickerProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  minLimit?: undefined | YearMonthPickerBuffer,
  maxLimit?: undefined | YearMonthPickerBuffer,
  selectedDate: YearMonthPickerBuffer,
  mode: YearMonthPickerMode,
  setMode: (mode: YearMonthPickerMode) => void,
  onChange: (buffer: YearMonthPickerBuffer, mode?: YearMonthPickerMode) => void,
};

const getCurrentDate = (): Date => {
  return new Date();
};

const getCurrentMonth = (): Month => {
  return getCurrentDate().getMonth() as Month;
};

const getCurrentYear = (): Year => {
  return getCurrentDate().getFullYear();
};

const isValidLimit = (minMax: YearMonthPickerBuffer): boolean => {
  return !!(
    typeof minMax.month === 'number'
    && minMax.month >= 0
    && minMax.month <= 11
    && typeof minMax.year === 'number'
  );
};

const isAfter = (minLimit: YearMonthPickerBuffer, maxLimit: YearMonthPickerBuffer): boolean => {
  if (minLimit.year < maxLimit.year) {
    return false;
  }

  if (minLimit.year > maxLimit.year) {
    return true;
  }

  if (minLimit.year === maxLimit.year && minLimit.month > maxLimit.month) {
    return true;
  }

  return false;
};

const isValidMinMax = (minLimit?: YearMonthPickerBuffer, maxLimit?: YearMonthPickerBuffer): boolean => {
  if (minLimit) {
    if (!isValidLimit(minLimit)) {
      return false;
    }
  }

  if (maxLimit) {
    if (!isValidLimit(maxLimit)) {
      return false;
    }
  }

  if (minLimit && maxLimit) {
    return !isAfter(minLimit, maxLimit);
  }

  return true;
};

export const dateToBuffer = (date: Date): YearMonthPickerBuffer => {
  const month = date.getMonth() as Month;
  const year = date.getFullYear();

  return ({
    month,
    year,
  });
};

export const bufferToDate = (buffer: YearMonthPickerBuffer | null): Date | null => {
  return buffer && typeof buffer.month === 'number' && typeof buffer.year === 'number'
    ? new Date(buffer.year, buffer.month)
    : null;
};

export const getCurrentDateBuffer = () => {
  return dateToBuffer(getCurrentDate());
};

const initializeSelectBuffer = (
  selectedDate: YearMonthPickerBuffer,
  minLimit?: undefined | YearMonthPickerBuffer,
  maxLimit?: undefined | YearMonthPickerBuffer,
): YearMonthPickerBuffer => {
  const validMinMax = isValidMinMax(minLimit, maxLimit);
  const currentDate = getCurrentDate();
  const defaultDateBuffer = selectedDate && isValidLimit(selectedDate) ? selectedDate : dateToBuffer(currentDate);
  let date = defaultDateBuffer;

  if (validMinMax) {
    // if min or max limit is greater than current date, use limit instead of current date to initialize buffer
    if (minLimit && isAfter(minLimit, defaultDateBuffer)) {
      date = minLimit;
    } else if (maxLimit && isAfter(defaultDateBuffer, maxLimit)) {
      date = maxLimit;
    }
  }

  return date;
};

export const yearMonthPickerBufferToRange = (selectedDate: YearMonthPickerBuffer): { start: Date, end: Date } | null => {
  if (!selectedDate) {
    return null;
  }

  const date = new Date(selectedDate.year, selectedDate.month);

  const start = startOfMonth(date);
  const end = set(lastDayOfMonth(date), {
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 999,
  });

  return ({
    start,
    end,
  });
};

export const YearMonthPicker = (props: YearMonthPickerProps) => {
  const {
    minLimit,
    maxLimit,
    selectedDate,
    mode,
    setMode,
    onChange,
    className,
  } = props;

  const [selectBuffer, updateSelectBuffer] = React.useState<YearMonthPickerBuffer>(initializeSelectBuffer(
    selectedDate,
    minLimit,
    maxLimit
  ));

  // biome-ignore lint/correctness/useExhaustiveDependencies: Should only run once.
  React.useEffect(() => {
    if (selectedDate.month !== selectBuffer.month || selectedDate.year !== selectBuffer.year) {
      // If the selected date is not valid, it will be updated to a valid date.
      onChange(selectBuffer);
    }

    if (selectBuffer.month !== getCurrentMonth() || selectBuffer.year !== getCurrentYear()) {
      // Current date is outside the min max range.
      // Update mode to select
      setMode('select');
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only call `updateSelectBuffer` when the buffer changes.
  React.useEffect(() => {
    // After opening the dropdown and while incrementing or decremening the year,
    // there is a chance that the selected month gets out of range of the min limit or max limit.
    // In that scenario we will reset the value to the closest limit.
    if (selectBuffer && isValidMinMax(minLimit, maxLimit)) {
      if (minLimit && isAfter(minLimit, selectBuffer)) {
        updateSelectBuffer({ ...minLimit });
      } else if (maxLimit && !isAfter(maxLimit, selectBuffer)) {
        updateSelectBuffer({ ...maxLimit });
      }
    }
  }, [selectBuffer.month, selectBuffer.year]);

  const handleSelectChange = () => {
    // change event is triggered for select box, on close or by clicking done.
    onChange(selectBuffer, 'select');
  };

  const canDecreaseYear = (!minLimit || !isValidLimit(minLimit) || selectBuffer.year > minLimit.year);

  const canIncreaseYear = (!maxLimit || !isValidLimit(maxLimit) || selectBuffer.year < maxLimit.year);

  const isMonthSelectable = (date: YearMonthPickerBuffer): boolean => {
    let selectable = true;
    const validMinMax = isValidMinMax(minLimit, maxLimit);

    if (validMinMax) {
      if (minLimit && isAfter(minLimit, date)) {
        selectable = false;
      }

      if (maxLimit && isAfter(date, maxLimit)) {
        selectable = false;
      }
    }

    return selectable;
  };

  const getPreviousMonth = (): YearMonthPickerBuffer => {
    const currentMonth = getCurrentMonth();
    const currentYear = getCurrentYear();
    const isFirstMonth = currentMonth === 0;
    // If we are selecting the previous month of JAN we need to also decrement the year
    return ({
      month: isFirstMonth ? 11 : currentMonth - 1 as Month,
      year: isFirstMonth ? currentYear - 1 : currentYear,
    });
  };

  const renderSelect = () => {
    const date = bufferToDate(selectBuffer);

    const handlePreviousYearClick = () => {
      if (canDecreaseYear) {
        updateSelectBuffer((buffer: YearMonthPickerBuffer) => {
          const { year } = buffer;
          return ({ ...buffer, year: year - 1 });
        });
      }
    };
    
    const handleNextYearClick = () => {
      if (canIncreaseYear) {
        updateSelectBuffer(buffer => {
          const { year } = buffer;
          return ({ ...buffer, year: year + 1 });
        });
      }
    };
    
    const handleMonthClick = (monthKey: Month) => {
      if (isMonthSelectable({ month: monthKey, year: selectBuffer.year })) {
        updateSelectBuffer((buffer: YearMonthPickerBuffer) => ({
          ...buffer,
          month: monthKey,
        }));
      }
    };
    
    return (
      <Dropdown
        toggle={
          <Button plain tabIndex={-1} className="bkl-year-month-picker__select-trigger">
            {date && mode === 'select' ? format(date, 'MMMM, yyyy') : 'Select a month'}
            <i // FIXME: replace with <Icon/>
              className={cx(
                'bkl-select__caret bkl-caret bkl-caret--down',
              )}
            />
          </Button>
        }
        offset={[0, 10]}
        className="bkl-year-month-picker__select"
        onClose={handleSelectChange}
      >
        {({ close }) => (
          <>
            <div className="bkl-year-month-picker__select-header">
              <Button
                plain
                onClick={handlePreviousYearClick}
                disabled={!canDecreaseYear}
              >
                <Icon
                  name="chevron-left"
                  icon={import(`../../../assets/icons/chevron-left.svg?sprite`)}
                  className={cx('bkl-year-month-picker__year-decrement', {
                    'bkl-year-month-picker__year-decrement--disabled': !canDecreaseYear,
                  })}
                  border
                />
              </Button>

              <span className="bkl-year-month-picker__year">{selectBuffer.year}</span>
              
              <Button
                plain
                onClick={handleNextYearClick}
                disabled={!canIncreaseYear}
              >
                <Icon
                  name="chevron-right"
                  icon={import(`../../../assets/icons/chevron-right.svg?sprite`)}
                  className={cx('bkl-year-month-picker__year-increment', {
                    'bkl-year-month-picker__year-increment--disabled': !canIncreaseYear,
                  })}
                  border
                />
              </Button>
            </div>

            <div className="bkl-year-month-picker__select-body">
              {Object.keys(monthInfo).map((month : string) => {
                const monthKey = parseInt(month, 10) as unknown as Month;

                return (
                  <Button
                    plain
                    className={cx('bkl-year-month-picker__month', {
                      'bkl-year-month-picker__month--selected': selectBuffer?.month === monthKey,
                      'bkl-year-month-picker__month--disabled': !isMonthSelectable({ month: monthKey, year: selectBuffer.year }),
                    })}
                    key={monthKey}
                    onClick={() => {
                      handleMonthClick(monthKey);
                    }}
                  >
                    {monthInfo[monthKey].label}
                  </Button>
                );
              })}
            </div>

            <div className="bkl-year-month-picker__select-action">
              <Button
                primary
                onClick={() => {
                  handleSelectChange();
                  close();
                }}
              >
                Done
              </Button>
            </div>
          </>
        )}
      </Dropdown>
    );
  };

  return (
    <SwitcherButtons
      selected={mode}
      onChange={setMode}
      className={cx('bkl bkl-year-month-picker', className)}
    >
      <SwitcherButtons.Button
        optionKey="current"
        className="option option--current"
        disabled={!isMonthSelectable(dateToBuffer(getCurrentDate()))}
        onClick={() => {
          updateSelectBuffer(initializeSelectBuffer(selectedDate, minLimit, maxLimit));
          onChange(dateToBuffer(getCurrentDate()), 'current');
        }}
      >
        Current month
      </SwitcherButtons.Button>
      <SwitcherButtons.Button
        optionKey="previous"
        className="option option--previous"
        disabled={!isMonthSelectable(getPreviousMonth())}
        onClick={() => {
          updateSelectBuffer(initializeSelectBuffer(selectedDate, minLimit, maxLimit));
          onChange(getPreviousMonth(), 'previous');
        }}
      >
        Previous month
      </SwitcherButtons.Button >
      <SwitcherButtons.Button
        // NOTE: use querySelector because we can't pass ref on dropdown to control focus on keyboard accessibility
        ref={document.querySelector('.bkl-year-month-picker__select-trigger')}
        tabIndex={-1}
        optionKey="select"
        className="option option--select"
      >
        {renderSelect()}
      </SwitcherButtons.Button>
    </SwitcherButtons>
  );
};
