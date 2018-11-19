'use strict'

const fs = require('fs')
const path = require('path')

function exists (folderPath) {
  try {
    fs.accessSync(folderPath, fs.constants.R_OK)
    return true
  } catch (e) {}
  return false
}

module.exports = {

  exists,

  find: name => {
    const ownResourcePath = path.join(__dirname, '../node_modules', name)
    if (exists(ownResourcePath)) {
      return ownResourcePath
    }
    const sharedResourcePath = path.join(__dirname, '../..', name)
    if (exists(ownResourcePath)) {
      return sharedResourcePath
    }
    console.error(`Unable to locate module '${name}'`.red)
    process.exit(-1)
  }

}
