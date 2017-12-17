import { SET_STATE } from './actions'

export default function reducer(state = {}, action) {
  if (
    action.type === SET_STATE &&
    (!state[action.payload.componentKey] || !action.payload.initializing)
  ) {
    return {
      ...state,
      [action.payload.componentKey]: action.payload.newState,
    }
  }

  return state
}
