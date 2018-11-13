require('./index').then(sap => {
  sap.ui.require([
    'sap/ui/model/odata/v2/ODataModel'
  ], function (ODataModel) {
    console.log('Creating ODataModel...')
    const model = new ODataModel({
      serviceUrl: 'https://services.odata.org/V2/OData/OData.svc'
    })
    model.metadataLoaded().then(() => {
      console.log('Loading products...')
      model.read('/Products', {
        success: data => {
          console.log(data)
        }
      })
    })
  })
})
