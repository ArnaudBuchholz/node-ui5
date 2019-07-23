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
  if (settings.traces.verbose) {
    console.log('RES'.magenta, url.cyan, status)
  }
}

function inject (settings, url, content) {
  if (settings.traces.ui5) {
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
    if (url.startsWith(settings.bootstrap.base)) {
      return sendUrl(settings, url)
    }
    const sResourceRoot = settings.baseURL + RESOURCE_ROOT_PREFIX
    if (url.startsWith(sResourceRoot)) {
      return sendFile(settings, url, url.substring(sResourceRoot.length))
    }
    return null
  }

}
