const fs = require('fs')
const path = require('path')
const openui5BaseDir = path.join(__dirname, 'node_modules/@openui5/sap.ui.core/dist/resources')
const URL = 'http://node-ui5.server.net/'
const reResource = new RegExp(`^(?:${URL})?resources/(.*)$`)

module.exports = {

  baseUrl: URL,

  read: url => {
    try {
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
