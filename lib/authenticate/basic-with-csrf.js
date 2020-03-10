/* global sap, btoa, XMLHttpRequest */
sap.ui.define([
], function () {
  'use strict'

  return function nodeUi5AuthenticateBasicWithCsrf ({ url, user, password }) {
    const headers = {
      Authorization: 'Basic ' + btoa(`${user}:${password}`)
    }
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('HEAD', url, true)
      xhr.setRequestHeader('X-CSRF-Token', 'Fetch')
      xhr.setRequestHeader('Authorization', headers.Authorization)
      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState === 4) {
          headers.cookie = xhr.getResponseHeader('set-cookie').join('; ') // TODO clean useless info
          headers['x-csrf-token'] = xhr.getResponseHeader('x-csrf-token')
          resolve({
            serviceUrl: url,
            tokenHandling: false,
            headers: headers
          })
        }
      })
      xhr.addEventListener('timeout', () => {
        reject()
      })
      xhr.send()
    })
  }
})
