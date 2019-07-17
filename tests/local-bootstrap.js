const { join } = require('path')
const localBootstrap = join(__dirname, '../node_modules/@openui5/sap.ui.core/dist/resources/sap-ui-core.js')).replace(/\\/g, '/')
console.log(localBootstrap)
require('../factory')({
  debug: true,
  bootstrapLocation: localBootstrap
}).then(require('./odata-client'))
