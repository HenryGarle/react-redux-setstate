import { connect } from 'react-redux'
import { storeShape } from 'react-redux/lib/utils/PropTypes'
import { setState } from './actions'
import { assert, generateRandomKey } from './utils'

const componentKeyProp = '__reactReduxSetState_componentKey__'
const componentStateProp = '__reactReduxSetState_state__'
const readyInstanceProp = '__reactReduxSetState_ready__'
const tempStateInstanceProp = '__reactReduxSetState_tempState__'

export default function connectComponentState(
  getComponentKey = generateRandomKey,
  reduxStateKey = 'componentState',
  storeContextKey = 'store'
) {
  assert(typeof getComponentKey, 'function')
  assert(typeof reduxStateKey, 'string')

  return Component => {
    class WrappedComponent extends Component {
      componentWillMount() {
        // Initialize state, assuming it was set in the constructor
        if (this[readyInstanceProp]) {
          this[readyInstanceProp]()
        }

        if (super.componentWillMount) {
          super.componentWillMount()
        }
      }

      get state() {
        return this.props[componentStateProp] || this[tempStateInstanceProp]
      }

      set state(state) {
        // A fallback value used in the getter if the Redux action has not been
        // dispatched yet, so the first render can use the initial values
        this[tempStateInstanceProp] = state

        // Only allow state to be initialized once. It must be done in the
        // constructor or it will be ignored.
        if (state == null || this[readyInstanceProp]) {
          return
        }

        assert(typeof state, 'object')

        // context has not been evaluated in the constructor; save a function
        // to execute in componentWillMount
        this[readyInstanceProp] = () => {
          this.context[storeContextKey].dispatch(
            setState(state, this.props[componentKeyProp], this, true)
          )
        }
      }

      setState(updater, callback) {
        // todo: invoke callback
        this.context[storeContextKey].dispatch(
          setState(updater, this.props[componentKeyProp], this)
        )
      }
    }

    Object.assign(WrappedComponent, Component)
    WrappedComponent.displayName = Component.displayName || Component.name
    WrappedComponent.contextTypes = {
      ...(Component.contextTypes || {}),
      [storeContextKey]: storeShape,
    }

    return connect(
      // Memoize mapStateToProps so that getComponentKey is called once when the
      // element is constructed for the first time
      (state, props) => {
        const componentKey = getComponentKey(props, Component)
        return (state, props) => ({
          [componentKeyProp]: componentKey,
          [componentStateProp]: state[reduxStateKey][componentKey],
        })
      },
      {}
    )(WrappedComponent)
  }
}
