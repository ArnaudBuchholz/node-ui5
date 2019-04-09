/* global sap */
sap.ui.require([
  'sap/ui/core/util/MockServer',
  'sap/base/Log'

], function (MockServer, Log) {
  'use strict'

  Log.setLevel(Log.Level.ERROR)

  var CONST = {
    OData: {
      entityNames: {
        todoItemSet: 'TodoItemSet',
        appConfigurationSet: 'AppConfigurationSet'
      },
      entityProperties: {
        appConfiguration: {
          key: 'Key',
          enable: 'Enable'
        },
        todoItem: {
          guid: 'Guid',
          title: 'Title',
          dueDate: 'DueDate',
          completed: 'Completed',
          completionDate: 'CompletionDate'
        }
      },
      functionImports: {
        clearCompleted: {
          name: 'ClearCompleted',
          method: 'POST',
          returnType: {
            count: 'Count'
          }
        }
      }
    }
  }

  var STOP_PROCRASTINATING_GUID = '0MOCKSVR-TODO-MKII-MOCK-00000000'

  function _getJSONDateReplacer (dValue) {
    return '/Date(' + dValue.getTime() + ')/'
  }

  var _lastTodoItemId = 0

  function _getNewItemGuid () {
    var sNewId = (++_lastTodoItemId).toString()
    return '0MOCKSVR-TODO-MKII-DYNK-00000000'.substr(0, 32 - sNewId.length) + sNewId
  }

  function _setIfNotSet (oTodoItemSet, sPropertyName, vDefaultValue) {
    if (!oTodoItemSet.hasOwnProperty(sPropertyName)) {
      oTodoItemSet[sPropertyName] = vDefaultValue
    }
  }

  // init the mockserver instance
  var _oMockServer = new MockServer({
    rootUri: '/odata/TODO_SRV/' // ensure there is a trailing slash
  })

  // configure mock server with a delay of 1s
  MockServer.config({
    autoRespond: true,
    autoRespondAfter: 10
  })

  // load local mock data
  _oMockServer.simulate(sap.ui.require.toUrl('myApp/mock/metadata.xml'), {
    sMockdataBaseUrl: sap.ui.require.toUrl('myApp/mock')
  })

  // Trace requests
  // Object.keys(MockServer.HTTPMETHOD).forEach(function (sMethodName) {
  //   var sMethod = MockServer.HTTPMETHOD[sMethodName]
  //   _oMockServer.attachBefore(sMethod, function (oEvent) {
  //     var oXhr = oEvent.getParameters().oXhr
  //     console.log('MockServer::before', sMethod, oXhr.url, oXhr)
  //   })
  //   _oMockServer.attachAfter(sMethod, function (oEvent) {
  //     var oXhr = oEvent.getParameters().oXhr
  //     console.log('MockServer::after', sMethod, oXhr.url, oXhr)
  //   })
  // })

  // Generate random items
  var aTodoItemSet = _oMockServer.getEntitySetData(CONST.OData.entityNames.todoItemSet)
  var sDateMax = '/Date(' + new Date(2099, 11, 31).getTime() + ')/'
  var sDateNow = '/Date(' + (new Date().getTime() - 60000) + ')/'
  var iCount = 100
  for (var idx = 0; idx < iCount; ++idx) {
    var oNewTodoItemSet = {}

    var sGuid = _getNewItemGuid()
    oNewTodoItemSet[CONST.OData.entityProperties.todoItem.guid] = sGuid
    oNewTodoItemSet[CONST.OData.entityProperties.todoItem.title] = 'Random stuff ' + idx
    oNewTodoItemSet.__metadata = {
      id: "/odata/TODO_SRV/TodoItemSet(guid'" + sGuid + "')",
      uri: "/odata/TODO_SRV/TodoItemSet(guid'" + sGuid + "')",
      type: 'TODO_SRV.TodoItem'
    }
    if (idx % 2) {
      oNewTodoItemSet[CONST.OData.entityProperties.todoItem.completionDate] = sDateNow
      oNewTodoItemSet[CONST.OData.entityProperties.todoItem.completed] = true
    }
    if (idx % 5 === 0) {
      oNewTodoItemSet[CONST.OData.entityProperties.todoItem.dueDate] = sDateNow
    }
    aTodoItemSet.push(oNewTodoItemSet)
  }
  aTodoItemSet.forEach(function (oTodoItemSet) {
    _setIfNotSet(oTodoItemSet, CONST.OData.entityProperties.todoItem.completionDate, null)
    _setIfNotSet(oTodoItemSet, CONST.OData.entityProperties.todoItem.completed, false)
    _setIfNotSet(oTodoItemSet, CONST.OData.entityProperties.todoItem.dueDate, sDateMax)
  })
  _oMockServer.setEntitySetData(CONST.OData.entityNames.todoItemSet, aTodoItemSet)

  var aRequests = _oMockServer.getRequests()

  // Creation of a todo list item
  aRequests.push({
    method: 'POST',
    path: CONST.OData.entityNames.todoItemSet,
    response: function (oXhr) {
      // Initialize some fields
      var oBody = JSON.parse(oXhr.requestBody)
      oBody[CONST.OData.entityProperties.todoItem.completed] = false
      oBody[CONST.OData.entityProperties.todoItem.completionDate] = null
      oXhr.requestBody = JSON.stringify(oBody)
      return false // Keep default processing
    }
  })

  function _handleUpdateBody (oXhr, sTodoItemGuid) {
    // Inject or remove completion date/time
    var oBody = JSON.parse(oXhr.requestBody)
    if (sTodoItemGuid === STOP_PROCRASTINATING_GUID) {
      oXhr.respond(400, {
        'Content-Type': 'text/plain;charset=utf-8'
      }, "I'll start tomorrow !")
      return true // Skip default processing
    }
    if (oBody[CONST.OData.entityProperties.todoItem.completed]) {
      oBody[CONST.OData.entityProperties.todoItem.completionDate] = _getJSONDateReplacer(new Date())
    } else {
      oBody[CONST.OData.entityProperties.todoItem.completionDate] = null
    }
    oXhr.requestBody = JSON.stringify(oBody)
    return false // Keep default processing
  }

  var _updatePath = new RegExp(CONST.OData.entityNames.todoItemSet + "\\(guid(?:'|%27)([^'%]+)(?:'|%27)\\)")

  // Update (MERGE) of a todo list item
  aRequests.push({
    method: 'MERGE',
    path: _updatePath,
    response: _handleUpdateBody
  })

  // Update (PUT) of a todo list item
  aRequests.push({
    method: 'PUT',
    path: _updatePath,
    response: _handleUpdateBody
  })

  // Getting a todo list item with filter
  // aRequests.push({
  //   method: 'GET',
  //   path: CONST.OData.entityNames.todoItemSet + '\\?.*\\$filter=.*',
  //   response: function (oXhr) {
  //     // Simulate error
  //     oXhr.respond(400, {
  //       'Content-Type': 'text/plain;charset=utf-8'
  //     }, 'Get failed')
  //     return true // Skip default processing
  //   }
  // })

  // Clear Completed
  aRequests.push({
    method: CONST.OData.functionImports.clearCompleted.method,
    path: CONST.OData.functionImports.clearCompleted.name,
    response: function (oXhr) {
      var aInitialTodoItemSet = _oMockServer.getEntitySetData(CONST.OData.entityNames.todoItemSet)

      var aClearedTodoItemSet = aInitialTodoItemSet.filter(function (oTodoItem) {
        return !oTodoItem[CONST.OData.entityProperties.todoItem.completed]
      })

      var oReturnType = {}

      var oResult = {}
      _oMockServer.setEntitySetData(CONST.OData.entityNames.todoItemSet, aClearedTodoItemSet)
      oReturnType[CONST.OData.functionImports.clearCompleted.returnType.count] = aInitialTodoItemSet.length - aClearedTodoItemSet.length
      oResult[CONST.OData.functionImports.clearCompleted.name] = oReturnType
      oXhr.respond(200, {
        'Content-Type': 'application/json;charset=utf-8'
      }, JSON.stringify({
        d: oResult
      }))
      return true // Skip default processing
    }
  })

  _oMockServer.setRequests(aRequests)

  _oMockServer.start()
})
