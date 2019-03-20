'use strict'

const { $window } = require('./const')
const $element = Symbol('element')

class ClassList {
  constructor (window, element) {
    this[$window] = window
    this[$element] = element
  }

  add (...classNames) {
    classNames.forEach(className => {
      if (!this.contains(className)) {
        this._classNames += ' ' + className
      }
    })
  }

  get _classNames () {
    return this[$element].getAttribute('class')
  }

  set _classNames (value) {
    this[$element].setAttribute('class', value)
  }

  contains (className) {
    return this._classNames.split(' ').includes(className)
  }

  remove (...classNames) {
    this._classNames = this._classNames
      .split(' ')
      .filter(className => !classNames.includes(className))
      .join(' ')
  }
}

module.exports = ClassList
