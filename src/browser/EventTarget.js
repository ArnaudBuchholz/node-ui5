'use strict'

const $events = Symbol('events')

class EventTarget {
  constructor () {
    this[$events] = {}
  }

  addEventListener (type, eventHandler) {
    if (!this[$events][type]) {
      this[$events][type] = []
    }
    this[$events][type].push(eventHandler)
  }

  dispatchEvent (event) {
    const type = event.type
    if (this[`on${type}`]) {
      this[`on${type}`]()
    }
    if (this[$events][type]) {
      this[$events][type].forEach(eventHandler => eventHandler(this))
    }
  }
}

module.exports = EventTarget
