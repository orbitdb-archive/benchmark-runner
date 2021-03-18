'use strict'
const http = require('http')
const WebSocket = require('ws')

class BenchmarkServer {
  constructor ({ bPaths, rPath, port }) {
    this.bPaths = bPaths
    this.rPath = rPath
    this.port = port
    this._server = null
    this._wss = null
    this.onResults = () => {}
  }

  create () {
    this._server = http.createServer(this._httpListener.bind(this)).listen(this.port)
    this._wss = new WebSocket.Server({ server: this._server })
    this._wss.on('connection', this._handleWsConnection.bind(this))
    return this
  }

  _httpListener (req, res) {
    if (req.url === '/api/results' && req.method === 'PUT') {
      return this._handleResults(req, res)
    } else {
      res.writeHead(200)
      res.end()
    }
  }

  async _handleResults (req, res) {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      this.onResults(body)
      res.writeHead(200)
      res.end()
    })
  }

  async _handleWsConnection (ws) {
    ws.on('message', m => console.log(m))
  }
}

module.exports = BenchmarkServer
