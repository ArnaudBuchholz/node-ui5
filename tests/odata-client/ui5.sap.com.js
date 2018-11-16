require('../factory').build({
  bootstrapLocation: 'https://ui5.sap.com/1.60.1/resources/sap-ui-core.js'
}).then(require('./tests'))
