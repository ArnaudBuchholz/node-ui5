'use strict'

const { assert } = require('./common')

module.exports = oNodeUI5Promise => oNodeUI5Promise.then(({ sap }) => {
  sap.ui.require([
    'sap/ui/model/odata/v2/ODataModel'
  ], async function (ODataModel) {
    console.log('Creating ODataModel...')
    const model = new ODataModel({
      serviceUrl: 'https://services.odata.org/V2/OData/OData.svc'
    })
    await model.metadataLoaded()
    console.log('Loading products...')
    model.read('/Products', {
      success: data => {
        data.results.forEach(product => {
          console.log(product.Name.padEnd(20, ' '), product.Description)
        })
        assert(() => data.results.length !== 0)
      },
      error: reason =>  {
        console.error(reason)
        assert(() => !'read failed')
      }
    })
  })
}, reason => {
  console.error(reason)
  assert(() => !'node-ui5 promise rejected')
})
