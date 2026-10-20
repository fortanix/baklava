
import {
  type OpenChangeEvent,
  type OpenStateProps,
  type UseFloatingElementOptions,
  type UseFloatingElementResult,
  useFloatingElement,
} from '../floating-ui/useFloatingElement.tsx';


export type {
  OpenChangeEvent,
  OpenStateProps,
  UseFloatingElementOptions as UseFloatingMenuOptions,
  UseFloatingElementResult as UseFloatingMenuResult,
};

/** Utility wrapper for `useFloatingElement`, specialized for menus. */
export const useFloatingMenu = (options: UseFloatingElementOptions): UseFloatingElementResult => {
  return useFloatingElement({
    triggerAction: 'click',
    placement: 'bottom',
    offset: 8,
    ...options,
    floatingUiFlipOptions: {
      fallbackAxisSideDirection: 'none',
      fallbackStrategy: 'initialPlacement',
      ...options.floatingUiFlipOptions,
    },
  });
};
