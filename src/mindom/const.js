'use strict'

module.exports = {

  $name: Symbol('name'),
  $nodeType: Symbol('nodeType'),
  $settings: Symbol('settings'),
  $window: Symbol('window'),

  defineConstants: (object, constants) => {
    Object.keys(constants).forEach(name => {
      Object.defineProperty(object, name, {
        value: constants[name],
        writable: false
      })
    })
  }

}
