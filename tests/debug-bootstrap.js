'use strict'

const { assert } = require('./common')

require('../factory')({
  bootstrapLocation: 'openui5@latest/debug'
}).then(({ sap }) => {
  require('./odata-client')({ sap, assert })
}, reason => {
  console.error(reason)
  assert(() => !'invalid boostrap')
})
