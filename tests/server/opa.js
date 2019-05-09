/* global QUnit, sap */
QUnit.config.autostart = false
sap.ui.require([
  'sap/ui/test/Opa5',
  'sap/ui/test/opaQunit',
  'sap/ui/test/actions/Press',
  'sap/ui/test/matchers/Properties'
], function (Opa5, opaTest, Press, Properties) {
  'use strict'

  QUnit.module('Simple server action')

  Opa5.extendConfig({
    autoWait: true
  })

  opaTest('Should get a response', function (Given, When, Then) {
    // Act
    Given.iStartMyAppInAFrame('/proxy/https/openui5.hana.ondemand.com/#/entity/sap.uxap.ObjectPageLayout/sample/sap.uxap.sample.ObjectPageOnJSON')

    // Use full screen
    When.waitFor({
      controlType: 'sap.m.Button',
      matchers: [new Properties({
        icon: 'sap-icon://full-screen'
      })],
      actions: new Press(),
      success: function () {
        Opa5.assert.ok(true, 'Full screen')
      }
    })

    // Click show code
    When.waitFor({
      controlType: 'sap.m.Button',
      matchers: [new Properties({
        icon: 'sap-icon://syntax'
      })],
      actions: new Press(),
      success: function () {
        Opa5.assert.ok(true, 'Show code')
      }
    })

    // Click API reference
    When.waitFor({
      controlType: 'sap.m.Button',
      matchers: [new Properties({
        text: 'API Reference'
      })],
      actions: new Press(),
      success: function () {
        Opa5.assert.ok(true, 'API reference')
      }
    })

    // Then.iTeardownMyAppFrame()
  })

  QUnit.start()
})
