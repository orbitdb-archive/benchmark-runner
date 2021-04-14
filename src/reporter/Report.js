import React from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { ResponsiveLineCanvas } from '@nivo/line'

const getResultsMetric = results => metric => {
  const metricIndex = results.metrics.indexOf(metric)
  if (metricIndex === -1) throw new Error('metric does not exist')
  return results.recorded.map(s => s[metricIndex])
}

const getAvg = (nums) => nums.reduce((a, c) => a + c, 0) / nums.length
const getMax = (nums) => nums.reduce((a, c) => Math.max(a, c), 0)

const getCoords = (x) => (d, i) => ({ y: d, x: x[i] })

export default function Report ({ result }) {
  const getMetric = getResultsMetric(result)
  const recorded = result.metrics.reduce((a, c) => {
    a[c] = getMetric(c)
    return a
  }, {})
  const time = recorded.time.map(x => x / 1000)

  return (
    <>
      <Dropdown.Divider />
      <Stats result={result} recorded={recorded} time={time} />
      <Dropdown.Divider />
      <MetricChart
        title='heap usage (mb)'
        data={[
          {
            id: 'used',
            color: 'hsl(231, 70%, 50%)',
            data: recorded['heap used'].map(getCoords(time))
          },
          {
            id: 'total',
            color: 'hsl(115, 70%, 50%)',
            data: recorded['heap total'].map(getCoords(time))
          }
        ]}
        time={time}
        yLegend='megabytes'
      />
      {result.metrics
        .filter(m => !['time', 'heap used', 'heap total'].includes(m))
        .map((m, i) =>
          <MetricChart
            key={i}
            title={m}
            data={[
              {
                id: m,
                color: 'hsl(231, 70%, 50%)',
                data: recorded[m].map(getCoords(time))
              }
            ]}
            yLegend={m}
          />
        )}
    </>
  )
}

function Stats ({ result, recorded, time }) {
  return (
    <>
      <h5>stats</h5>
      <Row>
        <Col>elapsed time:</Col>
        <Col>{time[time.length - 1]} seconds</Col>
      </Row>
      {result.metrics
        .filter(m => m !== 'time')
        .map((m, i) => {
          const label = m.includes('heap') ? ' mb' : ''
          return (
            <div key={i}>
              <Row>
                <Col>avg {m}:</Col>
                <Col>{getAvg(recorded[m]).toFixed(2)}{label}</Col>
              </Row>
              <Row>
                <Col>max {m}:</Col>
                <Col>{getMax(recorded[m]).toFixed(2)}{label}</Col>
              </Row>
            </div>
          )
        })}
    </>
  )
}

function MetricChart ({ title, data, time, yLegend }) {
  return (
    <div style={{ height: 'fit-content', marginBottom: '50px' }}>
      <h5>{title}</h5>
      <div style={{ height: '400px', width: '800px' }}>
        <ResponsiveLineCanvas
          margin={{ top: 10, right: 100, bottom: 100, left: 60 }}
          data={data}
          xFormat=' <-d'
          // curve='basis'
          xScale={{ type: 'point', min: 0, max: 'auto' }}
          yScale={{ type: 'linear', min: 0, max: 'auto' }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: 'bottom',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            tickValues: [],
            legend: 'seconds',
            legendOffset: 36,
            legendPosition: 'middle'
          }}
          enableGridX={false}
          axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: yLegend,
            legendOffset: -50,
            legendPosition: 'middle'
          }}
          enablePoints={false}
          interactive={false}
          useMesh
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'row',
              justify: false,
              itemsSpacing: 0,
              itemDirection: 'right-to-left',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle'
            }
          ]}
        />
      </div>
    </div>
  )
}
