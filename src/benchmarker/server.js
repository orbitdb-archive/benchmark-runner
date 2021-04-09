'use strict'
const WebSocket = require('ws')
const { parse, types } = require('./ws-action')
const logMessage = (id, msg) =>
`benchmark id:${id}
${msg}
`

class BenchmarkerServer {
  constructor ({ port } = {}) {
    this._wss = new WebSocket.Server({ port: port || 0 })
    this._wss.on('connection', this._handleWsConnection.bind(this))
    this.address = this._wss.address.bind(this._wss)
    this.results = {}
  }

  static create (opts) { return new BenchmarkerServer(opts) }

  async _handleWsConnection (ws) {
    ws.on('message', m => {
      const { info, type, msg } = parse(m)
      switch (type) {
        case types.LOG:
          console.log(logMessage(info.id, msg))
          break
        case types.SEGMENT: {
          const { name, env } = info
          if (!this.results[name]) this.results[name] = {}
          if (!this.results[name][env]) this.results[name][env] = info
          if (!this.results[name][env].recorded) this.results[name][env].recorded = []
          this.results[name][env].recorded.push(msg)
          break
        }
      }
    })
  }
}

module.exports = BenchmarkerServer
