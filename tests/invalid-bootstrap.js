'use strict'

/* global process */

require('../factory')({
  bootstrapLocation: 'resources/sap-ui-core-unk.js'
}).then(sap => {
  console.error('unexpected success')
  process.exit(-1)
}, reason => {
  console.log(reason.toString())
})
