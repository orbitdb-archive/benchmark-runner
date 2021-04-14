import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import Report from './Report'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import results from './results'

const getDefaultEnv = (n) => Object.keys(results[n]).sort().reverse()[0]

function App () {
  const resultsKeys = Object.keys(results).sort()
  const [nav, setNav] = useState(resultsKeys[0])
  // tries to show 'node' env first
  const [env, setEnv] = useState(getDefaultEnv(nav))
  const activeKey = results[nav][env] ? env : getDefaultEnv(nav)

  return (
    <Tab.Container activeKey={nav} onSelect={setNav}>
      <Row>
        <Col sm={3}>
          <Nav variant='pills' className='flex-column'>

            {resultsKeys.map((n, i) =>
              <Nav.Item key={i}>
                <Nav.Link eventKey={n}>{n}</Nav.Link>
              </Nav.Item>
            )}

          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content>

            {resultsKeys.map((n, i) =>
              <Tab.Pane key={i} eventKey={n}>
                <Tabs activeKey={activeKey} onSelect={setEnv}>

                  {Object.keys(results[n]).sort().reverse().map((e, i) =>
                    <Tab key={i} eventKey={e} title={e}>
                      <Report result={results[n][e]} />
                    </Tab>
                  )}

                </Tabs>
              </Tab.Pane>
            )}

          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  )
}

const element = document.createElement('div')
element.id = 'app'
document.body.appendChild(element)
ReactDOM.render(<App />, element)
