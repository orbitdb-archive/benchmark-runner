'use strict'
const path = require('path')
const fs = require('fs').promises
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineAssetsHtmlPlugin = require('inline-assets-html-plugin')
const webpackEntry = path.join(__dirname, 'App.js')
const processResults = require('./process-results.js')
const { benchmarks, envs } = require('./util')

module.exports = async function (output, results, baselines) {
  if (baselines) baselines = require(baselines)
  processResults(results, baselines)

  consoleReport(results)

  if (output) {
    console.log(`writing output to ${output}`)
    await fs.mkdir(path.dirname(output), { recursive: true })
    if (output.endsWith('.json')) {
      await jsonReport(output, results)
    } else if (output.endsWith('.html')) {
      await htmlReport(output, results)
    }
    console.log(`output=${output}`)
  }
}

function consoleReport (results) {
  const sp = (n) => new Array(Math.max(0, n)).fill(' ').join('')
  const report =
`
benchmarks report:
--------------------------------------------------------------------------------
${benchmarks(results).sort().map(benchmark => [
  `${sp(2)}${benchmark}`,
  envs(results)(benchmark).sort().reverse().map(env => [
    `${sp(4)}${env}`,
    results[benchmark][env].stats
      .map(s => {
        const c1 = `${sp(6)}${s[0]}`
        const c2 = `${sp(50 - c1.length)}${s[1]}`
        const c3 = s[2] ? `${sp(60 - c1.length - c2.length)}${s[2]}` : ''
        return c1 + c2 + c3
      })
  ])
]).flat(4).map(v => v + '\n').join('')}
--------------------------------------------------------------------------------
`
  process.stdout.write(report)
}

async function jsonReport (output, results) {
  return fs.writeFile(output, JSON.stringify(results))
}

async function htmlReport (output, results) {
  return new Promise((resolve, reject) => {
    webpack(
      {
        mode: 'production',
        entry: webpackEntry,
        output: {
          path: path.dirname(output)
        },
        module: {
          rules: [
            {
              test: path.join(__dirname, 'results.js'),
              use: [{ loader: 'val-loader', options: { results } }]
            },
            {
              test: /\.js$/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react']
                }
              },
              exclude: /node_modules/
            },
            {
              test: /\.css$/i,
              use: ['style-loader', 'css-loader']
            }
          ]
        },
        plugins: [
          new HtmlWebpackPlugin({
            filename: path.basename(output)
          }),
          new InlineAssetsHtmlPlugin({
            test: /\.(css|js)$/, // Required: regexp test of files to inline
            emit: false
          })
        ]
      },
      (err, stats) => {
        if (err) {
          reject(err)
        } else if (stats.hasErrors()) {
          reject(stats.compilation.errors)
        } else {
          resolve()
        }
      }
    )
  })
}
