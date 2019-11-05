'use strict'

const assert = require('assert')

module.exports = condition => {
  const message = condition.toString().match(/(?:=>|{)([^}]*)\}?/)[1].toString()
  assert(condition(), message)
}
