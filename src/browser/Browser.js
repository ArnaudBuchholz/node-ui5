'use strict'

const url = require('url')
const Window = require('./Window')

class Browser {

  constructor () {
    this._window = new Window()
  }

  eval (code) {
    debugger

  }

  get window () {
    return this._window
  }

}

module.exports = Browser
