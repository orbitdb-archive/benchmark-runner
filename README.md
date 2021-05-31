# OrbitDB Benchmark Runner (_benchmark-runner_)

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/orbitdb/Lobby) [![Matrix](https://img.shields.io/badge/matrix-%23orbitdb%3Apermaweb.io-blue.svg)](https://riot.permaweb.io/#/room/#orbitdb:permaweb.io)

> OrbitDB Benchmark Runner

## Install

`npm i orbit-db-benchmark-runner`

## CLI Usage

Check [cli.js](./src/cli.js) or use `npx benchmarker -h` for help

*If you want to run benchmarks in a folder have their file name end in `.benchmark.js`.*

```
Options:
  -V, --version             output the version number
  -b, --benchmarks <path>   benchmark folder or file (default: "./benchmarks")
  -o, --output <file path>  report output path (.html or .json)
  -i, --baselines <path>    baselines to use for comparison (.json output)
  --no-node                 skip nodejs benchmarks
  --no-browser              skip browser benchmarks
```

##### Running Comparisons

1. Create the baseline report output to use for comparison: `npx benchmarker -o report.json`
2. Use the output baseline report with the baseline option: `npx benchmarker -i report.json`

***benchmarks ran for comparison are best ran on their own machine or a machine with few other things happening in the background***

## Writing Benchmarks

Benchmark files must export an object with an asynchronous method `benchmark`. The method takes 1 parameter `benchmarker` which is used to control the recording and give information about the benchmark. Please see [test.benchmark.js]('./test/fixtures/benchmarks/test.benchmark.js') for an example. 

## Contributing

If you think this could be better, please [open an issue](https://github.com/orbitdb/benchmark-runner/issues/new)!

Please note that all interactions in [@orbitdb](https://github.com/orbitdb) fall under our [Code of Conduct](CODE_OF_CONDUCT.md).

**Note:** The commits of this repository had to be fixed from the initial import. This means if you had forked the repo and had prepared contributions, you need now to rebase them against the latest master. There should not be any conflicts.

## License

[MIT](LICENSE) © OrbitDB Community
