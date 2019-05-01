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
      mappings: [{
        // http/https proxy
        match: /^\/proxy\/(https?)\/(.*)/,
        url: '$1://$2'
      }, {
        // ui5 resource access
        match: /\/resources\/(.*)/,
        ui5resources: '$1'
      }, {
        // mock server mapping
        match: /^(\/odata\/.*)/,
        mock: '$1'
      }, {
        // mock server mapping (with a different base URL)
        match: /^\/api\/(.*)/,
        mock: '/odata/TODO_SRV/$1'
      }, {
        // gpf.js
        match: /^\/gpf\.js$/,
        file: path.join(__dirname, '../../node_modules/gpf-js/build/gpf.js')
      }, {
        // default access to index.html
        match: /^\/$/,
        file: path.join(__dirname, 'index.html')
      }, {
        // mapping to file access
        match: /(.*)/,
        file: path.join(__dirname, '$1')
      }]
    }).on('ready', () => {
      if (process.send) {
        process.send('ready')
      }
    })
  })
})
