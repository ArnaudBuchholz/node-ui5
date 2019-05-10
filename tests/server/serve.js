'use strict'

/* global process */

require('../../factory')({
  resourceroots: {
    myApp: __dirname
  }
}).then(({ sap, window }) => {
  sap.ui.require([
    'myApp/mock/server'
  ], function () {
    require('../../serve')({
      window,
      port: 8080,
      mappings: require('./mappings')
    }).on('ready', () => {
      if (process.send) {
        process.send('ready')
      }
    })
  })
})
