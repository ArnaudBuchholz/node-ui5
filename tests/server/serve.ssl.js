'use strict'
/* global process */

const path = require('path')

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
      ssl: {
        key: path.join(__dirname, 'privatekey.pem'),
        cert: path.join(__dirname, 'certificate.pem')
      },
      mappings: require('./mappings')
    }).on('ready', () => {
      if (process.send) {
        process.send('ready')
      }
    })
  })
})
