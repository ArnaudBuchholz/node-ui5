/* global QUnit, sap */
QUnit.config.autostart = false
sap.ui.require([
  'sap/ui/test/Opa5',
  'sap/ui/test/opaQunit',
  'sap/ui/test/actions/Press',
  'sap/ui/test/matchers/Properties'
], function (Opa5, opaTest, Press, Properties) {
  'use strict'

  QUnit.module('OPA end to end example')

  Opa5.extendConfig({
    autoWait: true
  })

  function clickButton (oOpa, mProperties, sLabel) {
      oOpa.waitFor({
        controlType: 'sap.m.Button',
        matchers: [new Properties(mProperties)],
        actions: new Press(),
        success: function () {
          Opa5.assert.ok(true, sLabel)
        }
      })
  }

  opaTest('Should get a response', function (Given, When, Then) {
    // Act
    Given.iStartMyAppInAFrame('/proxy/https/openui5.hana.ondemand.com/#/entity/sap.uxap.ObjectPageLayout/sample/sap.uxap.sample.ObjectPageOnJSON')

    clickButton(When, { icon: 'sap-icon://full-screen' }, 'Full screen')
    clickButton(When, { icon: 'sap-icon://syntax' }, 'Show code')
    clickButton(When, { text: 'API Reference' }, 'API reference')

    // Then.iTeardownMyAppFrame()
  })

  QUnit.start()
})
