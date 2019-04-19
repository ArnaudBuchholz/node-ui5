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
      redirect: [{
        match: /\/google(.*)/,
        url: 'http://www.google.com$1'
      }, {
        match: /\/\/ui5\/resources\/(.*)/,
        res: ''
      }, {
        match: /\/\/ui5\/test-resources\/(.*)/,
        res: ''
      }, {
        match: /odata(.*)/,
        ajax: ''
      }, {
        match: /.*/,
        file: ''
      }]
    }).on('ready', () => {
      if (process.send) {
        process.send('ready')
      }
    })
  })
})
