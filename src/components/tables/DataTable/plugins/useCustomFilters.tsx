
import * as React from 'react';
import * as ReactTable from 'react-table';


// Actions
ReactTable.actions.setCustomFilters = 'setCustomFilters';

const reducer = <D extends object>(
  state: ReactTable.TableState<D>,
  action: ReactTable.ActionType,
): ReactTable.ReducerTableState<D> | undefined => {
  if (action.type === ReactTable.actions.setCustomFilters) {
    return {
      ...state,
      customFilters: typeof action.customFilters === 'function'
        ? action.customFilters(state.customFilters)
        : action.customFilters,
    };
  }
  
  return state;
};

const useInstance = <D extends object>(instance: ReactTable.TableInstance<D>) => {
  const {
    state: { customFilters },
    dispatch,
  } = instance;
  
  const setCustomFilters = React.useCallback(
    customFilters => {
      return dispatch({ type: ReactTable.actions.setCustomFilters, customFilters });
    },
    [dispatch],
  );
  
  Object.assign(instance, {
    setCustomFilters,
  });
};

export const useCustomFilters = <D extends object>(hooks: ReactTable.Hooks<D>): void => {
  hooks.stateReducers.push(reducer);
  hooks.useInstance.push(useInstance);
};
