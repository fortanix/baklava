
import * as React from 'react';


export type UseFocusProps<T> = {
  autoFocus?: undefined | boolean,
  onFocus?: undefined | ((event: React.FocusEvent<T>) => void),
  onBlur?: undefined | ((event: React.FocusEvent<T>) => void),
};
export const useFocus = <T extends HTMLElement>({ autoFocus = false, onFocus, onBlur }: UseFocusProps<T>) => {
  const ref = React.useRef<T>(null);
  
  const [isFocused, setIsFocused] = React.useState(autoFocus);
  
  React.useEffect(() => {
    if (ref.current) {
      if (isFocused) {
        ref.current.focus();
      } else {
        ref.current.blur();
      }
    }
  }, [isFocused]);
  
  const handleFocus = (event: React.FocusEvent<T>) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(event);
    }
  };
  
  const handleBlur = (event: React.FocusEvent<T>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(event);
    }
  };
  
  return {
    ref,
    isFocused,
    handleFocus,
    handleBlur,
  };
};
