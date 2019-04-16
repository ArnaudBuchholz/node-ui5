'use strict'

const { assert } = require('./common')

require('../factory')({
  bootstrapLocation: 'resources/sap-ui-core-unk.js'
}).then(({ sap }) => {
  assert(() => !'unexpected success')
}, reason => {
  assert(() => !!reason.toString())
})
