'use strict'

require('colors')
const moduleHelper = require('./moduleHelper')
const path = require('path')
const childProcess = require('childProcess')

const ui5corePath = moduleHelper.find('@openui5/sap.ui.core')
const ui5buildPath = moduleHelper.find('@ui5/cli')

const distPath = path.join(ui5corePath, 'dist')
if (moduleHelper.exists(distPath)) {
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
