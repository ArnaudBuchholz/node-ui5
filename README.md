# node-ui5
A [NodeJS](https://nodejs.org/) wrapper for [OpenUI5](https://openui5.org/) to leverage
tools like
[MockServer](https://openui5.hana.ondemand.com/#/api/sap.ui.core.util.MockServer) or
[ODataModel](https://openui5.hana.ondemand.com/#/api/sap.ui.model.odata.v2.ODataModel).

[![Travis-CI](https://travis-ci.org/ArnaudBuchholz/node-ui5.svg?branch=master)](https://travis-ci.org/ArnaudBuchholz/node-ui5#)
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

You may use the factory to specify options:
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
* **exposeAsGlobals**: set to `true` to make `window` and `sap` be globally available in NodeJS
* **resourceroots**: an optional dictionary for mapping resources to local folders or remote resources
* **verbose**: set to `true` to see details on HTTP requests and output ui5 traces
* **fastButIncompleteSimulation**: set to `true` to replace jsdom with a faster (but incomplete) browser simulation.
Can also be set by adding `--fast` on the command line.
* **verbose**: set to `true` to enable traces.
Can also be set by adding `--verbose` on the command line.
* **debug**: set to `true` to enable all UI5 traces. When set, verbose mode is automatically enabled.
Can also be set by adding `--debug` on the command line.

## node-ui5 helpers

### Own modules

The package offers specific modules available through
[sap.ui.define](https://openui5.hana.ondemand.com/#/api/sap.ui/methods/sap.ui.define) /
[sap.ui.require](https://openui5.hana.ondemand.com/#/api/sap.ui/methods/sap.ui.require) to simplify development:

* `'node-ui5/authenticate/basic-with-csrf'` provides a
[basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) method with
[x-csrf-token](https://en.wikipedia.org/wiki/Cross-site_request_forgery) generation. The method expects an object
composed of `url`, `user` and `password` string values and returns a promise resolved to an object containing parameters
expected by the
[ODataModel constructor](https://openui5.hana.ondemand.com/#/api/sap.ui.model.odata.v2.ODataModel/constructor)
* `'node-ui5/promisify'` converts some callback API onto promise API by generating Async methods:
    - CRUD operations of [ODataModel](https://openui5.hana.ondemand.com/#/api/sap.ui.model.odata.v2.ODataModel)

```javascript
const CONNECTION = {
  url: 'https://my.odata.system/SERVICE',
  user: 'arnaud',
  password: '12345'
}
require('node-ui5').then(({sap}) => {
  sap.ui.require([
    'sap/ui/model/odata/v2/ODataModel',
    'node-ui5/authenticate/basic-with-csrf',
    'node-ui5/promisify',
], async function (ODataModel, authenticate) {
      const model = new ODataModel(await authenticate(CONNECTION))
      await model.metadataLoaded()
      console.log('Listing entities...')
      var data = await model.readAsync('/EntitySet')
      data.results.forEach(entity => {
        let name = entity.Name
        if (name.length > 40) {
            name = `${name.substring(0, 37)}...`
        }
        console.log(name.padEnd(40, ' '), entity.Guid)
      })
      console.log(`Found ${data.results.length} entities`)
    })
})
```

### Proxy server

The package also provides a server module that implements proxy features.

```javascript
require('node-ui5/serve')({
  port: 8080,
  mappings: [{
    // http/https proxy
    match: /^\/proxy\/(https?)\/(.*)/,
    url: '$1://$2'
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
  console.log('Server started')
})
```

The options are:

* **hostname**: *(default: `'127.0.0.1'`)* hostname the server should listen to
* **port**: *(default: `8080`)* port the server should listen to
* **ssl**: specify to implement secured http *(https)*, it must contain the path to the private key (member `key`) and to the certificate (member `cert`)
* **window**: if you plan to use the *mock* mapping, the `window` object must be transmitted
* **verbose**: *(default: `true` if `--verbose` or `--debug` is specified on the command line)* set to `true` to enable traces
* **mappings**: an array of mapping objects as detailed below. Mappings are evaluated in the given order

A mapping object is composed of at least two members:
* **match**: a regular expression matching the requested URL, capturing groups can be specified and values reused in the handler using $1, $2...
* One of these handlers:
    * **mock**: transmit to the mock server by redirecting to an AJAX request
    * **ui5resources**: transmit to UI5 resources loaded by node-ui5
    * **url**: URL redirection
    * **custom**: a function receiving [request](https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_class_http_incomingmessage) and [response](https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_class_http_serverresponse). Capturing group values are transmitted as additional parameters
    * **file**: file redirection

Example:

```javascript
[{
  // mock server mapping (with a different base URL)
  match: /^\/api\/(.*)/,
  mock: '/odata/TODO_SRV/$1'
}, {
  // UI5 resources
  match: /\/resources\/(.*)/,
  ui5resources: '$1'
}, {
  // http/https proxy
  match: /^\/proxy\/(https?)\/(.*)/,
  url: '$1://$2'
}, {
  // echo service
  match: /^\/echo\/(.*)$/,
  custom: (request, response, textToEcho) => {
    response.writeHead(200, {
      'Content-Type': 'text/plain',
      'Content-Length': textToEcho.length
    })
    response.end(textToEcho)
  }
}, {
  // default access to index.html
  match: /^\/$/,
  file: path.join(__dirname, 'index.html')
}, {
  // mapping to file access
  match: /(.*)/,
  file: path.join(__dirname, '$1')
}]
```

# How does it work ?

[OpenUI5](https://openui5.org/) is a browser library.

Thanks to [jsdom](https://github.com/jsdom/jsdom) and some tweaked [XHR](https://developer.mozilla.org/fr/docs/Web/API/XMLHttpRequest) objects, the library is loaded in a [NodeJS](https://nodejs.org/) environment.

With version 2, a faster *but limited* simulation of browser is implemented (and available with the
**fastButIncompleteSimulation** option).

**NOTES**

[CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) implementation of [jsdom](https://github.com/jsdom/jsdom) is prevented by the custom XHR overrides.

If you plan to install the module globally (`npm install -g node-ui5`), you must define the
[environment variable](https://en.wikipedia.org/wiki/Environment_variable)
[`NODE_PATH`](https://nodejs.org/api/cli.html#cli_node_path_path) with:
* `set NODE_PATH=%APPDATA%\npm\node_modules` on Windows environment
* `export NODE_PATH=/usr/local/lib/node_modules` on a Unix-like environment

If you plan to connect to an [https](https://en.wikipedia.org/wiki/HTTPS) server with specific certificates,
make sure to declare the [certificate authority](https://en.wikipedia.org/wiki/Certificate_authority) with the
[environment variable](https://en.wikipedia.org/wiki/Environment_variable)
[`NODE_EXTRA_CA_CERTS`](https://nodejs.org/api/cli.html#cli_node_extra_ca_certs_file) or to ignore certificate errors by
setting the environment variable
[`NODE_TLS_REJECT_UNAUTHORIZED`](https://nodejs.org/api/cli.html#cli_node_tls_reject_unauthorized_value) to `0`.
