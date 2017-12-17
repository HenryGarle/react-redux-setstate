export const SET_STATE = '@@react-redux-setstate/UPDATE_COMPONENT_STATE'

export function setState(updater, componentKey, element, initializing = false) {
  const currentState = element.state || {}

  let newState
  if (typeof updater === 'object' && updater !== null) {
    newState = { ...currentState, ...updater }
  } else if (typeof updater === 'function') {
    // todo: defer until all previous queueds are done -- will require a subscriber
    newState = updater(currentState, element.props)
  } else {
    throw new Error('setState must be passed an object or function')
  }

  return {
    type: SET_STATE,
    payload: {
      componentKey,
      newState,
      initializing,
    },
  }
}
