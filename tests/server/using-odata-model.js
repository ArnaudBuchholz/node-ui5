'use strict'

const { serviceUrl, assert } = require('./common')

process.on('unhandledRejection', error => {
  console.log('unhandledRejection'.red, error.message)
})

async function checkAppConfiguration (model) {
  const clearCompletedAppConfig = 'AppConfigurationSet(\'ClearCompleted\')'
  console.log('Read ' + clearCompletedAppConfig)
  const appConfiguration = await model.readAsync('/' + clearCompletedAppConfig)
  assert(appConfiguration.Enable, clearCompletedAppConfig + '.Enable === true')
}

async function checkTodoItems (model) {
  console.log('Reading TODO items')
  const { results } = (await model.readAsync('/TodoItemSet'))
  assert(results.length, `Found ${results.length} items`)
  const item = results[0]
  'Guid,Title'.split(',').forEach(property => {
    assert(item[property], `First item ${property}: ${item[property]}`)
  })
}

async function checkItemLifecycle (model) {
  console.log('TODO item lifecycle')
  // CREATE
  console.log('CREATE'.yellow)
  const createdItem = await model.createAsync('/TodoItemSet', {
    Title: 'New item',
    DueDate: `/Date(${new Date().getTime()})/`
  })
  assert(createdItem.Guid, 'Created item guid: ' + createdItem.Guid)
  // READ
  console.log('READ'.yellow)
  const path = `/TodoItemSet(guid'${createdItem.Guid}')`
  const readItem = await model.readAsync(path)
  assert(readItem.Guid, 'Read item guid: ' + createdItem.Guid)
  assert(readItem.Completed === false, 'Item completed is: ' + readItem.Completed)
  assert(readItem.CompletionDate === null, 'Item has no completion date time')
  // UPDATE
  console.log('UPDATE (PUT)'.yellow)
  readItem.Completed = true
  await model.updateAsync(path, { Completed: true })
  // READ AGAIN
  console.log('READ AGAIN'.yellow)
  const updatedItem = await model.readAsync(path)
  assert(updatedItem.Guid, 'Updated item guid: ' + createdItem.Guid)
  assert(updatedItem.Completed === true, 'Item completed is: ' + readItem.Completed)
  assert(updatedItem.CompletionDate !== null, 'Item has a completion date time: ' + updatedItem.CompletionDate)
  // DELETE
  console.log('DELETE'.yellow)
  await model.remove(path)
  // TRY TO READ
  try {
    await model.readAsync(path)
  } catch (e) {
    assert(true, e.message)
  }
}

require('../../factory')({
//   bootstrapLocation: 'resources/sap-ui-core-dbg.js',
//   verbose: true
})
  .then(({ sap }) => {
    sap.ui.require([
      'sap/ui/model/odata/v2/ODataModel',
      'node-ui5/promisify'
    ], async function (ODataModel) {
      console.log('Creating ODataModel...')
      const model = new ODataModel({
        serviceUrl /*, useBatch: false */
      })
      console.log('Reading $metadata')
      await model.metadataLoaded()
      await checkAppConfiguration(model)
      await checkTodoItems(model)
      await checkItemLifecycle(model)
    })
  })
