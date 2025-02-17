/* Copyright (c) Fortanix, Inc.
|* This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of
|* the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { mergeRefs, useEffectOnce } from '../../../../util/reactUtil.ts';

import { Label } from '../Label.tsx';
import { Checkbox } from './Checkbox.tsx';


export type CheckboxTriState = boolean | 'indeterminate';

export type CheckboxTriProps = Omit<React.ComponentProps<typeof Checkbox>, 'checked' | 'defaultChecked'> & {
  /** The default state of the checkbox at initialization time. Default: undefined. */
  defaultChecked?: undefined | CheckboxTriState,
  
  /**
   * Whether the checkbox is checked, unchecked, or indeterminate (neither checked nor unchecked). The indeterminate
   * state cannot be triggered by a user, it can only be set programmatically only. Default: `undefined` (uncontrolled).
   */
  checked?: undefined | CheckboxTriState,
  
  /** Callback for update events, will be called with the new state of the checkbox. */
  onUpdate?: undefined | ((checked: CheckboxTriState) => void),
};

export type CheckboxTriLabeledProps = CheckboxTriProps & {
  label: React.ComponentProps<typeof Label>['label'],
  labelProps?: undefined | React.ComponentProps<typeof Label>,
};
export const CheckboxTriLabeled = ({ label, labelProps, ...props }: CheckboxTriLabeledProps) =>
  <Label position="inline-end" label={label} {...labelProps}><CheckboxTri {...props}/></Label>;

/**
 * A variant of checkbox that allows a third "indeterminate" state meaning neither checked nor unchecked. This can be
 * useful for example for "select all" checkboxes, where the checkbox will be indeterminate if some (but not all) of
 * the items are currently checked.
 */
export const CheckboxTri = Object.assign(
  (props: CheckboxTriProps) => {
    const {
      unstyled = false,
      defaultChecked,
      checked,
      ...propsRest
    } = props;
    
    const checkboxRef = React.useRef<React.ComponentRef<typeof Checkbox>>(null);
    
    // Keep track of the `indeterminate` state of the checkbox. Needed so that we can rerender the component when
    // `indeterminate` changes. There is no event that triggers when `indeterminate` is changed.
    const [_internalIndeterminate, setInternalIndeterminate] = React.useState<undefined | boolean>(undefined);
    
    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      props.onChange?.(event);
      
      // Force rerender of the component if the `indeterminate` state changed (but `checked` didn't)
      setInternalIndeterminate(event.target.indeterminate);
      
      const checkedUpdated: CheckboxTriState = event.target.indeterminate ? 'indeterminate' : event.target.checked;
      props.onUpdate?.(checkedUpdated);
    }, [props.onChange, props.onUpdate]);
    
    // Sync `defaultChecked` with the checkbox
    useEffectOnce(() => {
      const checkbox = checkboxRef.current;
      if (!checkbox) { return; }
      checkbox.indeterminate = defaultChecked === 'indeterminate';
      setInternalIndeterminate(checkbox.indeterminate);
    });
    
    // Sync `checked` with the checkbox.
    // Note: HTML checkbox elements support an intermediate state, but it can only be set through the DOM.
    React.useEffect(() => {
      const checkbox = checkboxRef.current;
      if (!checkbox) { return; }
      if (typeof checked === 'undefined') { return; } // Do not run this for uncontrolled components
      
      if (checked === 'indeterminate' && !checkbox.indeterminate) {
        checkbox.indeterminate = true;
        setInternalIndeterminate(true);
      } else if (checked !== 'indeterminate' && checkbox.indeterminate) {
        checkbox.indeterminate = false;
        setInternalIndeterminate(false);
      }
    }, [checked]);
    
    // Note: use `true` if `indeterminate`, so that clicking on an indeterminate state goes to unchecked state
    const defaultCheckedBoolean: undefined | boolean = defaultChecked === 'indeterminate' ? true : defaultChecked;
    
    const checkedBoolean = ((): undefined | boolean => {
      // If the checkbox is uncontrolled, keep it uncontrolled
      if (typeof checked === 'undefined') { return undefined; }
      
      // Note: this considers `indeterminate` to imply `checked=true`. This is so that if the user clicks on the checkbox
      // while it is indeterminate, then the checkbox will change to unchecked.
      // Note: in HTML, the `checked` and `indeterminate` states are separate, so you can have `checked=false` and
      // `indeterminate=true`. If we want to support such a use case, we could consider adding a separate `indeterminate`
      // prop.
      return checked === 'indeterminate' ? true : checked;
    })();
    
    return (
      <Checkbox
        {...propsRest}
        ref={mergeRefs(checkboxRef, propsRest.ref)}
        defaultChecked={defaultCheckedBoolean}
        checked={checkedBoolean}
        onChange={handleChange}
      />
    );
  },
  {
    Labeled: CheckboxTriLabeled,
  },
);
