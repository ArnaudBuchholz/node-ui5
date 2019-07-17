const { join } = require('path')
require('./odata-client')(require('../factory')({
  debug: true,
  bootstrapLocation: join(__dirname, '../node_modules/@openui5/sap.ui.core/src/sap-ui-core.js')
}))
