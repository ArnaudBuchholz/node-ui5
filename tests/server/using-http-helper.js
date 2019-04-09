'use strict'

const gpf = require('gpf-js')
const { serviceUrl, assert } = require('./common')

async function checkMetadata () {
  console.log('Reading $metadata')
  const response = await gpf.http.get(serviceUrl + '$metadata')
  assert(response.status === 200, 'Status code')
  assert(response.responseText.length, 'Response')
  assert(response.responseText.startsWith('<?xml'), 'Looks like an XML')
}

async function checkAppConfiguration () {
  const entity = 'AppConfigurationSet(\'ClearCompleted\')'
  console.log('Read ' + entity)
  const response = await gpf.http.get(serviceUrl + entity)
  assert(response.status === 200, 'Status code')
  assert(response.responseText.length, 'Response')
  const appConfiguration = JSON.parse(response.responseText).d
  assert(appConfiguration.Enable, entity + '.Enable === true')
}

async function checkTodoItems () {
  console.log('Reading TODO items')
  const response = await gpf.http.get(serviceUrl + 'TodoItemSet')
  assert(response.status === 200, 'Status code')
  assert(response.responseText.length, 'Response')
  const items = JSON.parse(response.responseText).d.results
  assert(items.length, `Found ${items.length} items`)
  const item = items[0]
  'Guid,Title'.split(',').forEach(property => {
    assert(item[property], `First item ${property}: ${item[property]}`)
  })
}

async function checkItemLifecycle () {
  console.log('TODO item lifecycle')
  // CREATE
  console.log('CREATE'.yellow)
  const createResponse = await gpf.http.post(serviceUrl + 'TodoItemSet', JSON.stringify({
    Title: 'New item',
    DueDate: `/Date(${new Date().getTime()})/`
  }))
  assert(createResponse.status === 201, 'Status code (created)')
  assert(createResponse.responseText.length, 'Response')
  const createdItem = JSON.parse(createResponse.responseText).d
  assert(createdItem.Guid, 'Created item guid: ' + createdItem.Guid)
  // READ
  console.log('READ'.yellow)
  const path = `TodoItemSet(guid'${createdItem.Guid}')`
  const readResponse = await gpf.http.get(serviceUrl + path)
  assert(readResponse.status === 200, 'Status code')
  assert(readResponse.responseText.length, 'Response')
  const readItem = JSON.parse(readResponse.responseText).d
  assert(readItem.Guid, 'Read item guid: ' + createdItem.Guid)
  assert(readItem.Completed === false, 'Item completed is: ' + readItem.Completed)
  assert(readItem.CompletionDate === null, 'Item has no completion date time')
  // UPDATE
  console.log('UPDATE (PUT)'.yellow)
  readItem.Completed = true
  const updateResponse = await gpf.http.request({
    method: 'PUT',
    url: serviceUrl + path,
    data: JSON.stringify(readItem)
  })
  assert(updateResponse.status === 204, 'Status code (no content)')
  assert(!updateResponse.responseText.length, 'No response')
  // READ AGAIN
  console.log('READ AGAIN'.yellow)
  const updatedResponse = await gpf.http.get(serviceUrl + path)
  assert(updatedResponse.status === 200, 'Status code')
  assert(updatedResponse.responseText.length, 'Response')
  const updatedItem = JSON.parse(updatedResponse.responseText).d
  assert(updatedItem.Guid, 'Updated item guid: ' + createdItem.Guid)
  assert(updatedItem.Completed === true, 'Item completed is: ' + readItem.Completed)
  assert(updatedItem.CompletionDate !== null, 'Item has a completion date time: ' + updatedItem.CompletionDate)
  // DELETE
  console.log('DELETE'.yellow)
  const deleteResponse = await gpf.http.delete(serviceUrl + path)
  assert(deleteResponse.status === 204, 'Status code (no content)')
  // TRY TO READ
  console.log('TRYING TO READ'.yellow)
  const deletedResponse = await gpf.http.get(serviceUrl + path)
  assert(deletedResponse.status === 404, 'Status code (not found)')
}

(async function () {
  try {
    await checkMetadata()
    await checkAppConfiguration()
    await checkTodoItems()
    await checkItemLifecycle()
  } catch (e) {
    assert(false, e.toString())
  }
})()
