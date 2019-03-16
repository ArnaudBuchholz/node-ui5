'use strict'

class EventTarget {

  addEventListener () {
  }

}

EventTarget.mixin = MixinClass => {
  Object.getOwnPropertyNames(EventTarget.prototype)
    .filter(member => member !== "constructor")
    .forEach(member => {
      Object.defineProperty(MixinClass.prototype, member, {
        value: EventTarget.prototype[member]
      })
    })
}

module.exports = EventTarget
