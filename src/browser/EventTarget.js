'use strict'

class EventTarget {

  addEventListener () {
  }

}

EventTarget.mixin = MixinClass => {
  Object.assign(MixinClass.prototype, EventTarget.prototype)
}

module.exports = EventTarget
