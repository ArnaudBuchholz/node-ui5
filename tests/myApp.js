'use strict'

const { assert } = require('./common')

require('../factory')({
  exposeAsGlobals: true,
  resourceroots: {
    myApp: __dirname
  }
}).then(() => {
  /* global sap */
  console.log('Loading local module...')
  sap.ui.require([
    'myApp/localModule'
  ], function (module) {
    assert(() => module === 'Hello World !')
  })
})
