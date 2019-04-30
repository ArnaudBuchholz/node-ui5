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
      redirect: [{
        match: /^\/proxy\/(https?)\/(.*)/,
        url: '$1://$2'
      }, {
        match: /\/resources\/(.*)/,
        ui5resources: '$1'
      }, {
        match: /\/test-resources\/(.*)/,
        ui5Testresources: '$1'
      }, {
        match: /^\/(odata\/.*)/,
        mock: '$1'
      }, {
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
