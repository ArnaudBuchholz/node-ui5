require('colors')
const path = require('path')
const { spawn } = require('child_process')

function run (script) {
  console.log(script.cyan)
  return new Promise(resolve => {
    const child = spawn('node', [path.join(__dirname, `${script}.js`)].concat(process.argv.slice(2)), {
      stdio: 'inherit'
    })
    child.on('close', code => {
      resolve(code)
    })
  })
}

async function all () {
  const now = new Date()
  await run('default-bootstrap')
  await run('custom-bootstrap')
  await run('invalid-bootstrap')
  await run('myApp')
  console.log('Total time (ms): ', new Date() - now)
}

all()
