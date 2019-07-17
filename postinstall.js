'use strict'

require('colors')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

const ui5corePath = path.join(__dirname, 'node_modules/@openui5/sap.ui.core')
const ui5buildPath = path.join(__dirname, 'node_modules/@ui5/cli')

function folderExists (folderPath) {
  try {
    fs.accessSync(folderPath, fs.constants.R_OK)
    return true
  } catch (e) {
    return false
  }
}

if (!folderExists(ui5corePath)) {
  // Only for development mode
  process.exit(0);
}

const distPath = path.join(ui5corePath, 'dist')
if (folderExists(distPath)) {
  console.log('@openui5/sap.ui.core/dist folder already exists'.green)
  process.exit(0)
}

console.log('Building @openui5/sap.ui.core/dist...'.magenta)

const ui5build = childProcess.spawn('node', [
  path.join(ui5buildPath, 'bin/ui5'),
  'build',
  '--a'
], {
  cwd: ui5corePath,
  stdio: 'inherit'
})

ui5build.on('error', () => {
  console.error('ui5 build failed.'.red)
  process.exit(-1)
})
ui5build.on('close', () => {
  console.error('ui5 build done.'.green)
  process.exit(0)
})
