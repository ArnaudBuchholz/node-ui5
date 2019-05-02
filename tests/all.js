require('colors')
const path = require('path')
const { spawn, fork } = require('child_process')
const HeadlessChrome = require('simple-headless-chrome')

function run (script) {
  console.log(script.cyan)
  return new Promise(resolve => {
    const child = spawn('node', [path.join(__dirname, `${script}.js`)].concat(process.argv.slice(2)), {
      stdio: 'inherit'
    })
    child.on('close', code => {
      resolve(code !== 0)
    })
  })
}

let server
let onChromeMessage

function startServer () {
  console.log('Starting server'.cyan)
  return new Promise(resolve => {
    server = fork(path.join(__dirname, `server/serve.js`), process.argv.slice(2))
    server.on('message', message => {
      console.log('server message'.yellow, message.gray)
      if (message === 'ready') {
        resolve()
      } else {
        onChromeMessage(message === 'KO')
      }
    })
  })
}

async function testWithChrome () {
  const browser = new HeadlessChrome({ headless: true })
  const promise = new Promise(resolve => { onChromeMessage = resolve })
  await browser.init()
  const mainTab = await browser.newTab({ privateTab: false })
  await mainTab.goTo('http://localhost:8080')
    .then(function () {
      console.log('Chrome started...'.gray)
    })
  return promise
    .then(result => browser.close().then(() => {
      console.log('Chrome stopped.'.gray)
      return result
    }))
}

function stopServer () {
  server.kill('SIGINT')
}

async function all () {
  const now = new Date()
  let failed = false
  failed |= await run('default-bootstrap')
  failed |= await run('custom-bootstrap')
  failed |= await run('invalid-bootstrap')
  failed |= await run('myApp')
  failed |= await run('mindom/DOMParser')
  failed |= await run('mindom/evaluate')
  await startServer()
  failed |= await run('server/using-http-helper')
  failed |= await run('server/using-odata-model')
  failed |= await testWithChrome()
  console.log('Total time (ms): ', new Date() - now)
  stopServer()
  if (failed) {
    console.error(`At least one test failed`.red)
    process.exit(-1)
  } else {
    console.error(`All tests succeeded`.green)
    process.exit(0)
  }
}

all()
