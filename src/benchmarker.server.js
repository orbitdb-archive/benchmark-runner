'use strict'
const { writeFile } = require('fs').promises
const path = require('path')
const WebSocket = require('ws')
const { parse, types } = require('./ws-action')
const results = {}

class BenchmarkerServer {
  constructor ({ bPaths, rPath, port }) {
    this.bPaths = bPaths
    this.rPath = rPath
    this.port = port
    this._wss = new WebSocket.Server({ port: this.port })
    this._wss.on('connection', this._handleWsConnection.bind(this))
  }

  static create (opts) { return new BenchmarkerServer(opts) }

  async _handleWsConnection (ws) {
    ws.on('message', m => {
      const { id, type, msg } = parse(m)
      switch (type) {
        case types.LOG:
          console.log(
`benchmark id:${id}
${msg}
`
          )
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
    const benchmarkResultsPath = path.join(this.rPath, `${results.name}.json`)
    await writeFile(benchmarkResultsPath, JSON.stringify(results))
    console.log(`results written: ${benchmarkResultsPath}`)
  }
}

module.exports = BenchmarkerServer
