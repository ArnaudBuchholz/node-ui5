# node-ui5
A [NodeJS](https://nodejs.org/) wrapper for [OpenUI5](https://openui5.org/) to leverage tools like [MockServer](https://openui5.hana.ondemand.com/#/api/sap.ui.core.util.MockServer) or [ODataModel](https://openui5.hana.ondemand.com/#/api/sap.ui.model.odata.v2.ODataModel)

[![dependencies Status](https://david-dm.org/ArnaudBuchholz/node-ui5/status.svg)](https://david-dm.org/ArnaudBuchholz/node-ui5)
[![devDependencies Status](https://david-dm.org/ArnaudBuchholz/node-ui5/dev-status.svg)](https://david-dm.org/ArnaudBuchholz/node-ui5?type=dev)
[![node-ui5](http://img.shields.io/npm/dm/node-ui5.svg)](https://www.npmjs.org/package/node-ui5)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Setup

* Use [npm](https://www.npmjs.com/) to install: `npm install node-ui5` *(don't forget `--save` if part of your project)*

# Usage

```javascript
require('node-ui5').then(({sap}) => {
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
}).then(({sap}) => {
  // use sap
})
```

You may map local directories:
```javascript
require('node-ui5/factory')({
  exposeAsGlobals: true,
  resourceroots: {
    myApp: __dirname
  },
  verbose: true
}).then(() => {
  sap.ui.require([
    "myApp/mock/server"
  ], function () {
    /*...*/
  })
})
```

## Available options

* **bootstrapLocation**: provides URL of the `sap-ui-core.js` bootstrap
* **exposeAsGlobals**: set to `true` to make `browser`, `window` and `sap` be globally available in NodeJS
* **resourceroots**: an optional dictionary for mapping resources to local folders or remote resources
* **verbose**: set to `true` to see details on HTTP requests and output ui5 traces

# How does it work ?

[OpenUI5](https://openui5.org/) is a browser library.

Thanks to [jsdom](https://github.com/jsdom/jsdom) and some tweaked [XHR](https://developer.mozilla.org/fr/docs/Web/API/XMLHttpRequest) objects, the library is loaded in a [NodeJS](https://nodejs.org/) environment.

**NOTE**

[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) implementation of [jsdom](https://github.com/jsdom/jsdom) is prevented by the custom XHR overrides.
