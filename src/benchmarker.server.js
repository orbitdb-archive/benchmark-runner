'use strict'
const { writeFile } = require('fs').promises
const path = require('path')
const http = require('http')
const WebSocket = require('ws')
const { parse, types } = require('./ws-action')
const results = {}

class BenchmarkServer {
  constructor ({ bPaths, rPath, port }) {
    this.bPaths = bPaths
    this.rPath = rPath
    this.port = port
    this._server = null
    this._wss = null
  }

  create () {
    this._server = http.createServer(this._httpListener.bind(this)).listen(this.port)
    this._wss = new WebSocket.Server({ server: this._server })
    this._wss.on('connection', this._handleWsConnection.bind(this))
    return this
  }

  _httpListener (req, res) {
    res.writeHead(200)
    res.end()
  }

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

module.exports = BenchmarkServer
