'use strict'

/* global process */

require('../factory')({
  exposeAsGlobals: true,
  resourceroots: {
    myApp: __dirname
  }
}).then(() => {
  /* global sap */
  console.log('Loading local module...')
  sap.ui.define([
    'myApp/localModule'
  ], function (module) {
    console.log(module)
    if (module !== 'Hello World!') {
      process.exit(-1)
    }
  })
})
