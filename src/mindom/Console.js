'use strict'

const CommonConsole = require('../Console')

const { $settings } = require('./const')

class Console extends CommonConsole {
  constructor (window) {
    super(window[$settings])
  }
}

module.exports = Console
