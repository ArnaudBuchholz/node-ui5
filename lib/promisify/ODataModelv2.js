/* global sap */
sap.ui.require([
  'sap/ui/model/odata/v2/ODataModel'
], function (ODataModel) {
  'use strict'

  const methods = {
    create: 2,
    read: 1,
    udpate: 2,
    remove: 1,
    callFunction: 1
  }

  Object.keys(methods).forEach(function (name) {
    const parametersIndex = methods[name]
    ODataModel.prototype[`${name}Async`] = function () {
      const native = ODataModel.prototype[name]
      const parameters = Object.assign({}, arguments[parametersIndex])
      const promise = new Promise((resolve, reject) => {
        parameters.success = (data, response) => {
          promise.response = response
          resolve(data)
        }
        parameters.error = reject
      })
      const abortable = native.apply(this, [].slice.call(arguments, 0, parametersIndex).concat(parameters))
      promise.abort = abortable.abort.bind(abortable)
      return promise
    }
  })
})
