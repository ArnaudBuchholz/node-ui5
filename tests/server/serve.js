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
      mappings: [{
        match: /^\/odata\/TODO_SRV\/(.*)/,
        mock: '/odata/TODO_SRV/$1'
      }]
    }).on('ready', () => {
      if (process.send) {
        process.send('ready')
      }
    })
  })
})
