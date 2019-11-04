'use strict'

const console = require('./null')
const assert = require('./assert')

describe('default bootstrap', () => {

  let _sap

  before(async function () {
    this.timeout(10000)
    const { sap } = await require('../../index')
    _sap = sap
  })

  it('enables odata testing', () => require('../odata-client')({ sap: _sap, console, assert }))

})
