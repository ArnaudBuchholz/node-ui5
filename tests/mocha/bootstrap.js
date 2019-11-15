'use strict'

'use strict'

const console = require('./null')
const assert = require('./assert')

module.exports = ({ title, settings = {} }) => {
  describe(title, () => {
    describe('jsdom', () => {
      let _sap
      before(async function () {
        this.timeout(60000)
        const { sap } = await require('../../factory')(settings)
        _sap = sap
      })
      it('enables odata testing', function () {
        this.timeout(20000)
        return require('../odata-client')({ sap: _sap, console, assert })
      })
    })

    describe('mindom', () => {
      let _sap
      before(async function () {
        this.timeout(60000)
        const { sap } = await require('../../factory')({
          fastButIncompleteSimulation: true,
          ...settings
        })
        _sap = sap
      })
      it('enables odata testing', function () {
        this.timeout(20000)
        return require('../odata-client')({ sap: _sap, console, assert })
      })
    })
  })
}
