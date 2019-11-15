'use strict'

const { assert } = require('./common')
const { join } = require('path')

require('../factory')({
  bootstrapLocation: join(__dirname, '../node_modules/@openui5/sap.ui.core/src/sap-ui-core.js')
}).then(({ sap }) => {
  require('./odata-client')({ sap, assert })
}, reason => {
  console.error(reason)
  assert(() => !'invalid boostrap')
})
