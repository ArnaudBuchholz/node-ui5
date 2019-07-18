const { join } = require('path')
require('./odata-client')(require('../factory')({
  bootstrapLocation: 'https://openui5.hana.ondemand.com/resources/sap-ui-core.js',
  bootstrapCache: join(__dirname, 'cache')
}))
