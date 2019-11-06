'use strict'

const { join } = require('path')

require('./bootstrap')({
  title: 'custom bootstrap',
  settings: {
    bootstrapLocation: 'https://openui5.hana.ondemand.com/resources/sap-ui-core.js',
    bootstrapCache: join(__dirname, '../cache')
  }
})
