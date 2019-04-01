'use strict'

require('colors')

module.exports = {

  HTML: 'text/html',
  XML: 'application/xml',

  assert: function (code) {
    let message = code.toString().match(/(?:=>|{)([^}]*)\}?/)[1].toString().trim()
    let condition
    try {
      condition = code()
    } catch (e) {
      condition = false
      message += ' ' + e.toString().gray
    }
    if (condition) {
      console.log('OK'.green, message)
    } else {
      console.error('KO'.red, message)
    }
  }

}
