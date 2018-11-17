# node-ui5
A [NodeJS](https://nodejs.org/) wrapper for [OpenUI5](https://openui5.org/) to leverage tools like [MockServer](https://openui5.hana.ondemand.com/#/api/sap.ui.core.util.MockServer) or [ODataModel](https://openui5.hana.ondemand.com/#/api/sap.ui.model.odata.v2.ODataModel)

# Setup

* Use [npm](https://www.npmjs.com/) to install: `npm install node-ui5` *(don't forget `--save` if part of your project)*

# Usage

```javascript
require('node-ui5').then(sap => {
  // use sap, for instance:
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
      }
    })
  })
})
```

You may use the factory to provide options:
```javascript
require('node-ui5/factory')({
  bootstrapLocation: 'https://openui5.hana.ondemand.com/resources/sap-ui-core.js',
  verbose: true
}).then(sap => {
    // use sap
})
```

Where:
* **bootstrapLocation**: provides URL of the `sap-ui-core.js` bootstrap
* **verbose**: set to `true` to see details on HTTP requests and output library traces

# How does it work ?

[OpenUI5](https://openui5.org/) is a browser library.

Thanks to [jsdom](https://github.com/jsdom/jsdom) and some tweaked [XHR](https://developer.mozilla.org/fr/docs/Web/API/XMLHttpRequest) objects, the library is loaded in a [NodeJS](https://nodejs.org/) environment.

**NOTE**

[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) implementation of [jsdom](https://github.com/jsdom/jsdom) is prevented by the custom XHR overrides.
