'use strict'

describe('default bootstrap', () => {

  let _sap

  before(() => require('../../index').then(({ sap }) => {
    _sap = sap
  }))

  it('enables odata testing', () => require('../odata-client')(Promise.resolve({ sap: _sap})))

})
