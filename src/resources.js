'use strict'

require('colors')
const fs = require('fs')
const path = require('path')
const gpf = require('gpf-js')
const moduleHelper = require('./moduleHelper')
const ui5corePath = moduleHelper.find('@openui5/sap.ui.core')
const ui5CoreDistResourcePath = path.join(ui5corePath, 'dist/resources')

function _trace (settings, url, status) {
  if (settings.verbose) {
    console.log('RES'.magenta, url.cyan, status)
  }
}

module.exports = {

  read: (settings, url) => {
    try {
      if (url.startsWith('http') && url === settings.bootstrapLocation) {
        return gpf.http.get(url).then(response => {
          if (response.status.toString().startsWith('2')) {
            _trace(settings, url, `${response.status} ${response.responseText.length}`.green)
            return response.responseText
          } else {
            _trace(settings, url, `${response.status}`.red)
            return ''
          }
        })
      }
      const reResource = new RegExp(`^(?:${settings.baseURL})?resources/(.*)$`)
      const match = reResource.exec(url)
      if (!match) {
        return
      }
      if (url.endsWith('css')) {
        _trace(settings, url, 'css'.green)
        return '/* style must not be empty */'
      }
      const resourcePath = path.join(ui5CoreDistResourcePath, match[1])
      fs.accessSync(resourcePath, fs.constants.R_OK)
      const content = fs.readFileSync(resourcePath).toString()
      _trace(settings, url, content.length.toString().green)
      return content
    } catch (e) {
      _trace(settings, url, e.toString().red)
    }
    return null // resource but not found
  }

}
