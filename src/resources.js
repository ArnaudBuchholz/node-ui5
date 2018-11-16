'use strict'

const fs = require('fs')
const path = require('path')
const openui5BaseDir = path.join(__dirname, '../node_modules/@openui5/sap.ui.core/dist/resources')

module.exports = {

  read: (settings, url) => {
    try {
      const reResource = new RegExp(`^(?:${settings.baseURL})?resources/(.*)$`)
      const match = reResource.exec(url)
      if (!match) {
        return // undefined => not a resource
      }
      if (url.endsWith('css')) {
        return '/* style must not be empty */'
      }
      let resourcePath = path.join(openui5BaseDir, match[1])
      fs.accessSync(resourcePath, fs.constants.R_OK)
      return fs.readFileSync(resourcePath).toString()
    } catch (e) {}
    return null // resource but not found
  }

}
