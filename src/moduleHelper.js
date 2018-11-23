'use strict'

require('colors')
const fs = require('fs')
const path = require('path')
const ownResourceRelative = '../node_modules'
const sharedResourceRelative = '../..'

function exists (folderPath) {
  try {
    fs.accessSync(folderPath, fs.constants.R_OK)
    return true
  } catch (e) {}
  return false
}

function log (relative) {
    const relativePath = path.join(__dirname, relative)
    console.log(`${relativePath}:`.gray.underline, fs.readdirSync(relativePath).join(",").gray)
}

module.exports = {

  exists,

  find: name => {
    const ownResourcePath = path.join(__dirname, ownResourceRelative, name)
    if (exists(ownResourcePath)) {
      return ownResourcePath
    }
    const sharedResourcePath = path.join(__dirname, sharedResourceRelative, name)
    if (exists(ownResourcePath)) {
      return sharedResourcePath
    }
    console.error(`Unable to locate module '${name}'`.red)
    log(ownResourceRelative)
    log(sharedResourceRelative)
    process.exit(-1)
  }

}
