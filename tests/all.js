require('colors')
const path = require('path')
const { spawn, fork } = require('child_process')

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
function startServer () {
  console.log('Starting server'.cyan)
  return new Promise(resolve => {
    server = fork(path.join(__dirname, `server/serve.js`), process.argv.slice(2))
    server.on('message', resolve)
  })
}

function stopServer () {
  server.kill('SIGINT');
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
  console.log('Total time (ms): ', new Date() - now)
  if (failed) {
    console.error(`At least one test failed`.red)
  } else {
    console.error(`All tests succeeded`.green)
  }
  stopServer()
}

all()
