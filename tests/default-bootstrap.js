'use strict'

const { assert } = require('./common')

require('..').then(({ sap }) => {
  require('./odata-client')({ sap, assert })
})
