'use strict'
const path = require('path')
const fs = require('fs')
const { writeFile } = fs.promises
const WebSocket = require('ws')
const { parse, types } = require('./ws-action')
const results = {}
const logMessage = (id, msg) =>
`benchmark id:${id}
${msg}
`

class BenchmarkerServer {
  constructor ({ rPath, port }) {
    this.rPath = rPath
    this._wss = new WebSocket.Server({ port: port || 0 })
    this._wss.on('connection', this._handleWsConnection.bind(this))
    this.address = this._wss.address.bind(this._wss)
  }

  static create (opts) { return new BenchmarkerServer(opts) }

  async _handleWsConnection (ws) {
    ws.on('message', m => {
      const { id, type, msg } = parse(m)
      switch (type) {
        case types.LOG:
          console.log(logMessage(id, msg))
          break
        case types.INFO:
          results[id] = msg
          break
        case types.SEGMENT:
          if (!results[id].recorded) results[id].recorded = []
          results[id].recorded.push(msg)
          break
        case types.STOP:
          this._onResults(results[id])
          setTimeout(() => { delete results[id] })
          break
      }
    })
  }

  async _onResults (results) {
    results = { ...results }
    const rPathExists = fs.existsSync(this.rPath)
    if (!rPathExists) fs.mkdirSync(this.rPath, { recursive: true })
    const benchmarkResultsPath = path.join(this.rPath, `${results.name}.json`)
    await writeFile(benchmarkResultsPath, JSON.stringify(results))
    console.log(logMessage(results.id, `results written: ${benchmarkResultsPath}`))
  }
}

module.exports = BenchmarkerServer
