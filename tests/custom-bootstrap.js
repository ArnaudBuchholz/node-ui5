'use strict'

const { assert } = require('./common')
const { join } = require('path')

require('../factory')({
  bootstrapLocation: 'https://openui5.hana.ondemand.com/resources/sap-ui-core.js',
  bootstrapCache: join(__dirname, 'cache')
}).then(({ sap }) => {
  require('./odata-client')({ sap, assert })
})
