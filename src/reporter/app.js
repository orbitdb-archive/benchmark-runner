import React from 'react'
import ReactDOM from 'react-dom'
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs'
import '@reach/tabs/styles.css'
import { ResponsiveLineCanvas } from '@nivo/line'
import results from './results'
const maxHeight = { height: '100%' }
const maxWidth = { width: '100%' }
const maxSize = { ...maxHeight, ...maxWidth }

const panel = (result) => {
  return result.metrics.map((m, i) => {
    if (i === 0) return null

    const data = {
      id: m,
      data: result.recorded.map(s => ({ x: s[0], y: s[i].used ? s[i].used : s[i] }))
    }
    return (
      <div key={i} style={{ height: 'fit-content', marginBottom: '100px' }}>
        <h2>{m}</h2>
        <div style={{ height: '500px', width: '1000px' }}>
          <ResponsiveLineCanvas
            margin={{ top: 50, right: 50, bottom: 100, left: 100 }}
            data={[data]}
            xFormat=' <-d'
            xScale={{ type: 'point' }}
            yScale={{ type: 'linear' }}
            enableGridX={false}
            enableGridY
            enablePoints={false}
            lineWidth={3}
            curve='basis'
            // gridYValues={(() => {
            //   const time = (pos) => result.recorded[pos][i]
            //   const total = result.recorded.length
            //   return [
            //     time(0),
            //     time(Math.floor(total / 2)),
            //     time(result.recorded.length - 1)
            //   ]
            // })()}
            isInteractive={false}
            axisLeft={{
              // tickValues: (() => {
              //   const time = (pos) => result.recorded[pos][i]
              //   const total = result.recorded.length
              //   return [
              //     time(0),
              //     time(Math.floor(total / 2)),
              //     time(result.recorded.length - 1)
              //   ]
              // })(),
              // tickSize: 5,
              // tickPadding: 5,
              // tickRotation: 0,
              legend: m,
              legendOffset: -80,
              legendPosition: 'middle'
            }}
            axisBottom={{
              tickValues: [],
              // tickSize: 5,
              // tickPadding: 5,
              // tickRotation: 0,
              legend: 'ms',
              legendOffset: 30,
              legendPosition: 'middle'
            }}
          />
        </div>
      </div>
    )
  })
}

class App extends React.Component {
  render () {
    return (
      <Tabs orientation='vertical' style={maxSize}>
        <TabList style={{ height: 'fit-content', width: 'fit-content', whiteSpace: 'nowrap' }}>
          {Object.keys(results).map((k, i) => <Tab key={i}>{k}</Tab>)}
        </TabList>

        <TabPanels style={maxSize}>
          {Object.entries(results).map(([filename, result], i) => {
            return (
              <TabPanel
                key={i}
                style={{ marginLeft: '25px', height: 'fit-content', width: '80%' }}
              >
                {panel(result)}
              </TabPanel>
            )
          })}
        </TabPanels>
      </Tabs>
    )
  }
}

document.getElementsByTagName('html')[0].style.height = '100%'
document.getElementsByTagName('html')[0].style.margin = 0
document.body.style.height = '100%'
document.body.style.margin = 0
const ele = document.createElement('div')
ele.id = 'app'
document.body.appendChild(ele)
ele.style.height = '100%'
ele.style.marge = 0
ReactDOM.render(<App />, document.getElementById('app'))
