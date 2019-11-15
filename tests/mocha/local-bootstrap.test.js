'use strict'

const { join } = require('path')

require('./bootstrap')({
  title: 'custom bootstrap',
  settings: {
    bootstrapLocation: join(__dirname, '../../node_modules/@openui5/sap.ui.core/src/sap-ui-core.js')
  }
})
