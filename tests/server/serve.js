require('../../factory')({
  resourceroots: {
    myApp: __dirname
  }
}).then(({ sap, window }) => {
  console.log('tests\\server')
  sap.ui.require([
    'node-ui5/serve',
    'myApp/mock/server'
  ], function (serve) {
    console.log(serve)
    serve({
      window,
      port: 8080
    })
  })
})
