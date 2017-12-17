# react-redux-setstate

A HOC that overrides the React setState API to use Redux for storing component state.

This library allows you to use React's familiar `this.state` and `this.setState` API for controlling state on a component, while leveraging Redux's global store for managing application state.

One of Redux's key features is that state is *not* localized, meaning that it encourages reuse of application-wide state over redundancy of data. However, there are certainly times when your state is truly local to a component: for example, when a confirmation modal is open, or an expandable menu is toggled. In these instances, using Redux to manage state means a lot of headache in wiring components up to the store and setting up single-use action creators and reducers, as well as ensuring that collisions in the store namespace are avoided.

In these cases, it's often better to just use React's built-in state API, since it is properly isolated to the particular component instance. However, this has some major drawbacks:

* React component state is lost when hot-reloading
* React component state is lost if the component is unmounted
* The entire application state tree is not properly represented in Redux, meaning that restoring the state from `localStorage` or loading production state into a local environment to reproduce a bug is difficult

This library seeks to bridge the gap between the ease-of-use of React's state API with the power of Redux to completely manage application state. It accomplishes this by overriding the `state` getters and setters and the `setState` method on a class component via a decorator. You can use the React API you're already familiar with, and you will automatically leverage your Redux store.

## Installation

```sh
npm install react-redux-setstate
```

## Usage

Add the reducer to your `combineReducers` call, using the key `componentState`:


```js
import { reducer as componentState } from 'react-redux-setstate'

export default combineReducers({
  // ... your other reducers
  componentState,
})
```

Then, decorate your stateful component with the `connectComponentState` function:

```js
import React, { Component } from 'react'
import { connectComponentState } from 'react-redux-setstate'

class MyComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0,
    }
  }

  increment = () => {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    return (
      <div>
        {this.state.count}
        <button onClick={this.increment}>+</button>
      </div>
    )
  }
}

export default connectComponentState()(MyComponent)
```

The component's state will be stored in the `componentState` namespace in the Redux store, rather than in React's internal state manager.

Because the component can be rendered multiple times, the default behavior of react-redux-setstate is to generate a random identifier in the store for every instance of the component that is rendered, via a UUID. This is not ideal, since remounting the component (via an unmount/remount, state restoration, or hot-reload event) will generate a new ID.

Instead, you should pass a function into the decorator. The function will receive the component's props and must return a unique identifier for the component. Assuming this identifier is pure, deterministic, and will not collide, you can use this to restore state on the component from the store when it is remounted.

```js
const getComponentKey = props => `MyComponent__${props.id}`

export default connectComponentState(getComponentKey)(MyComponent)
```

Remember, this identifier must be globally unique across the app, for any and all instances of components that use react-redux-setstate. This may require passing additional props down to the component to guarantee its uniqueness. Of course, if your component is a singleton, you can just have this function return a constant string.

## Limitations

Here are some known limitations when using this library instead of React's built-in state API:

* Remember, Redux's state must be made up of plain, serializable data, whereas React state is in-memory and can include instances of other objects, like DOM elements or Dates. When using this library, make sure your component state is only primitive values, plain objects, and arrays.
* Directly setting a value to `this.state` can only be done once, and only within the constructor. Subsequent calls to the setter will be silently ignored.

## To-Dos

This project is in early development. The following tasks are still needed to fully emulate React's state API:

* [ ] Make component state available in lifecycle methods.
* [ ] Have `setState` also accept a function to manage multiple updates atomically.
* [ ] Have `setState` accept a callback to evaluate when the state has been updated and reflected.
* [ ] Improve documentation.
* [ ] Write tests.

