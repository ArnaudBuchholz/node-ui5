'use strict'

require('colors')
const fs = require('fs')
const path = require('path')
const gpf = require('gpf-js')
const debug = require('./debug')
const { promisify } = require('util')

const accessAsync = promisify(fs.access)
const readFileAsync = promisify(fs.readFile)

const RESOURCE_ROOT_PREFIX = '/_/'

function trace (settings, url, status) {
  if (settings.verbose) {
    console.log('RES'.magenta, url.cyan, status)
  }
}

function inject (settings, url, content) {
  if (settings.debug) {
    return debug.inject(settings, url, content)
  }
  return content
}

async function sendFile (settings, url, filePath) {
  await accessAsync(filePath, fs.constants.R_OK)
    .then(() => fs.readFileASync(filePath))
    .then(buffer => buffer.toString())
    .then(content => {
      trace(settings, url, content.length.toString().green)
      return inject(settings, url, content)
    })
    .catch(reason => {
      trace(settings, url, reason.toString().red)
      return null
    })
}

async function sendUrl (settings, url) {
  const response = await gpf.http.get(url)
  if (response.status.toString().startsWith('2')) {
    trace(settings, url, `${response.status} ${response.responseText.length}`.green)
    return inject(settings, url, response.responseText)
  } else {
    trace(settings, url, `${response.status}`.red)
    return ''
  }
}

module.exports = {

  declare: (settings, resourceroot) => {
    if (resourceroot.startsWith('http')) {
      return resourceroot
    }
    return settings.baseURL + RESOURCE_ROOT_PREFIX + resourceroot
  },

  read: (settings, url) => {
    console.log('RES'.gray, url.gray)
    if (url.startsWith(settings.bootstrap.base)) {
      return sendUrl(settings, url)
    }
    const sResourceRoot = settings.baseURL + RESOURCE_ROOT_PREFIX
    if (url.startsWith(sResourceRoot)) {
      return sendFile(settings, url, url.substring(sResourceRoot.length))
    }
    console.log('RES'.gray, url.gray, 'NOPE'.red)
    return Promise.resolve(null)
    // const dirname = path.dirname(settings.bootstrapLocation)
    // if (!isHttpUrl && url.startsWith(dirname)) {
    //   return sendFile(settings, url, url)
    // }
    // const reResource = new RegExp(`^(?:${settings.baseURL})?\bresources/(.*)$`)
    // const match = reResource.exec(url)
    // if (!match) {
    //   return
    // }
    // if (url.endsWith('css')) {
    //   trace(settings, url, 'css'.green)
    //   return '/* style must not be empty */'
    // }
    // return sendFile(settings, url, path.join(dirname, '..', match[1]))
  }

}
