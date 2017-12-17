const comparators = {
  '=': {
    compare: (value, expected) => value === expected,
    message: (value, expected) => `Expected "${value}" to equal "${expected}"`,
  },
  '!=': {
    compare: (value, expected) => value !== expected,
    message: (value, expected) =>
      `Expected "${value}" not to equal "${expected}"`,
  },
}

export function assert(value, expected, comparatorKey = '=', message = null) {
  const comparator = comparators[comparatorKey]
  if (!comparator) {
    throw new Error(`Unexpected comparator key "${comparatorKey}"`)
  }

  if (!comparator.compare(value, expected)) {
    if (message) {
      throw typeof message === 'string' ? new Error(message) : message
    } else {
      throw new Error(comparator.message(value, expected))
    }
  }
}

export function generateRandomKey(props, Component) {
  return `${Component.displayName || Component.name || 'Anonymous'}__${uuid()}`
}

export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
