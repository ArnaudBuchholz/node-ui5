'use strict'
/* global process */

require('colors')

let failedCount = 0

process.on('exit', () => {
  if (failedCount) {
    console.error(`${failedCount} assertions failed`.red)
  } else {
    console.error(`All assertions succeeded`.green)
  }
})

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
      ++failedCount
      console.error('KO'.red, message)
    }
  }

}
