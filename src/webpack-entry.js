'use strict'
const path = require('path')
const runSource = require('fs').readFileSync(path.join(__dirname, 'run.js'))
const comment = '// '
const indent = '  '

module.exports = function ({ file, host, basename, dir, hook }) {
  const lines = runSource.toString().split('\n')
  const browserImportIndex = lines.indexOf('// browser import') + 1
  const nodeImportIndex = lines.indexOf(indent + '// node import') + 1

  // edit ./run.js in memory to bundle
  lines[browserImportIndex] = lines[browserImportIndex]
    .slice(comment.length)
    .replace('%', `'${file}'`)
  lines[nodeImportIndex] = indent + comment + lines[nodeImportIndex].trimStart()
  const end = lines.pop()
  lines.push(`window.onload = () => run({
    host: '${host}',
    file: '${file}',
    basename: '${basename}',
    dir: '${dir}',
    hook: ${JSON.stringify(hook)}
  }).then(() => window.benchmarkComplete())`)
  lines.push(end)

  return { code: lines.join('\n') }
}
