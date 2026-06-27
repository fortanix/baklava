
export type Defined = null | {};

export type ControllableState<S extends Defined> = (
  | {
    state?: undefined, // Uncontrolled
    defaultState?: undefined | S,
    onStateChange?: undefined | ((state: S) => void),
  }
  | {
    state: S, // Controlled
    defaultState?: undefined,
    onStateChange: (state: S) => void,
  }
);

export type ControllableStateDef<S extends Defined> = {
  state: undefined | S,
  defaultState: undefined | S,
  defaultStateFallback: undefined | S,
  onStateChange: undefined | ((state: S) => void),
};

export type ControllableStateResult<S extends Defined> = ControllableStateDef<S> & {
  isControlled: boolean,
  stateInitial: undefined | S,
};
export const parseControllableState = <S extends Defined>(
  state: ControllableStateDef<S>,
): ControllableStateResult<S> => {
  const isControlled = typeof state.state !== 'undefined';
  const stateInitial = isControlled
    ? state.state
    : (typeof state.defaultState !== 'undefined' ? state.defaultState : state.defaultStateFallback);
  
  return {
    ...state,
    isControlled,
    stateInitial,
  };
};
