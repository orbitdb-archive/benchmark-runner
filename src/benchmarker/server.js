import WebSocket from 'ws'
import WsAction from './ws-action.js'
const logMessage = (id, msg) =>
`benchmark id:${id}
${msg}
`

export default class BenchmarkerServer {
  constructor ({ port } = {}) {
    this._wss = new WebSocket.Server({ port: port || 0 })
    this._wss.on('connection', this._handleWsConnection.bind(this))
    this.address = this._wss.address.bind(this._wss)
    this.results = {}
  }

  static create (opts) { return new BenchmarkerServer(opts) }

  async _handleWsConnection (ws) {
    ws.on('message', m => {
      const { info, type, msg } = WsAction.parse(m)
      switch (type) {
        case WsAction.types.LOG:
          console.log(logMessage(info.id, msg))
          break
        case WsAction.types.SEGMENT: {
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
