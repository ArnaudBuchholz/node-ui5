'use strict'

const $events = Symbol('events')

class EventTarget {
  addEventListener (type, eventHandler) {
    if (!this[$events]) {
      this[$events] = {}
    }
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
    if (this[$events] && xhr[$events][type]) {
      xhr[$events][type].forEach(eventHandler => eventHandler(this))
    }
  }
}

EventTarget.mixin = MixinClass => {
  Object.getOwnPropertyNames(EventTarget.prototype)
    .filter(member => member !== 'constructor')
    .forEach(member => {
      Object.defineProperty(MixinClass.prototype, member, {
        value: EventTarget.prototype[member]
      })
    })
}

module.exports = EventTarget
