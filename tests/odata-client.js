'use strict'

module.exports = ({ sap, assert, console = global.console }) => new Promise((resolve, reject) => {
  sap.ui.require([
    'sap/ui/model/odata/v2/ODataModel',
    'node-ui5/promisify'
  ], async function (ODataModel) {
    try {
      console.log('Creating ODataModel...')
      const model = new ODataModel({
        serviceUrl: 'https://services.odata.org/V2/OData/OData.svc',
        useBatch: false
      })
      await model.metadataLoaded()
      console.log('Loading products...')
      const { results } = await model.readAsync('/Products')
      results.forEach(product => {
        console.log(product.Name.padEnd(20, ' '), product.Description)
      })
      assert(() => results.length != 0)
    } catch (e) {
      reject(e)
    }
    resolve()
  })
})
