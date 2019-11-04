'use strict'

const noop = () => {}

module.exports = new Proxy({}, {
  get: () => noop
})
