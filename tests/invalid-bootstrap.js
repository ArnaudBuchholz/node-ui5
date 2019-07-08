'use strict'

const { assert } = require('./common')

require('../factory')({
  bootstrapLocation: 'invalid-path/sap-ui-core.js'
}).then(({ sap }) => {
  assert(() => !'unexpected success')
}, reason => {
  assert(() => !!reason.toString())
})
