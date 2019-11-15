'use strict'

const { assert } = require('./common')

require('..').then(({ sap }) => {
  require('./odata-client')({ sap, assert })
}, reason => {
  console.error(reason)
  assert(() => !'invalid boostrap')
})
