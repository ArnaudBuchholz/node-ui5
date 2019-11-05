'use strict'

'use strict'

const console = require('./null')
const assert = require('./assert')

module.exports = ({ title, settings = {} }) => {

  describe(title, () => {

    describe('jsdom', () => {
      let _sap
      before(async function () {
        this.timeout(10000)
        const { sap } = await require('../../factory')(settings)
        _sap = sap
      })
      it('enables odata testing', () => require('../odata-client')({ sap: _sap, console, assert }))
    })

    describe('mindom', () => {
      let _sap
      before(async function () {
        const { sap } = await require('../../factory')({
          fastButIncompleteSimulation: true,
          ...settings
        })
        _sap = sap
      })
      it('enables odata testing', () => require('../odata-client')({ sap: _sap, console, assert }))
    })

  })

}
