
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
    ...options,
    triggerAction: options.triggerAction ?? 'combobox',
    offset: options.offset ?? 8,
    placement: options.placement ?? 'bottom-start',
    floatingUiFlipOptions: {
      ...options.floatingUiFlipOptions,
      fallbackAxisSideDirection: options.floatingUiFlipOptions?.fallbackAxisSideDirection ?? 'none',
      fallbackStrategy: options.floatingUiFlipOptions?.fallbackStrategy ?? 'initialPlacement',
    },
  });
};




/*
type UseMenuSelectHandlerOptions = {
  previousActiveElementRef: React.RefObject<null | HTMLElement>,
  setIsOpen: (open: boolean) => void;
  triggerAction?: undefined | UseFloatingMenuOptions['triggerAction'];
  selected?: undefined | SelectedMultiState,
  defaultSelected?: undefined | SelectedMultiState,
  canCloseMenu?: undefined | boolean,
};
export const useMenuSelect = (options: UseMenuSelectHandlerOptions) => {
  const {
    previousActiveElementRef,
    setIsOpen,
    triggerAction = 'click',
    selected,
    defaultSelected,
    canCloseMenu = true,
  } = options;
  
  // If the 'selected' prop is provided, the component is treated as controlled.
  const isControlled = typeof selected !== 'undefined';
  // State 'internalSelected' stores the currently selected item keys.
  // When the menu provider is used in controlled mode, this state is kept
  // in sync with the `selected` prop.
  const [internalSelected, setInternalSelected] = React.useState<Set<ItemKey>>(() =>
    selected ?? defaultSelected ?? new Set()
  );
  
  React.useEffect(() => {
    if (isControlled) {
      // In controlled mode, keep internal state in sync with the parent-controlled value
      setInternalSelected(selected);
    }
  }, [isControlled, selected]);
  
  const handleInternalSelect = React.useCallback((selectedItems: SelectedMultiState) => {
    if (!isControlled) {
      // When not controlled by the parent, update the internal selection state directly
      setInternalSelected(selectedItems);
    }
    
    if (!canCloseMenu) { return; }

    window.setTimeout(() => {
      const previous = previousActiveElementRef.current;

      if (previous) {
        previous.focus({ focusVisible: false });

        if (previous instanceof HTMLInputElement) {
          // Move cursor to end
          const length = previous.value.length;
          previous.setSelectionRange(length, length);
        }
      }

      if (triggerAction !== 'focus') {
        setIsOpen(false);
      }
    }, 150);
  }, [
    triggerAction,
    setIsOpen,
    previousActiveElementRef,
    isControlled,
    canCloseMenu,
  ]);
  
  return {
    internalSelected,
    handleInternalSelect,
    setInternalSelected,
    isControlled,
  };
};
*/
