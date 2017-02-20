#!/usr/bin/env node

// TODO: this script sucks; usage on empty, actual validation, ect.

const fs = require('fs');
const path = require('path');

const program = require('commander');

const slsperf = require(path.join(__dirname, '..'));

let config = {
  provider: {},
  function: {},
  test: {}
};

let latencyTest = {
  type: 'latency',
  delay: 60000,
  delayIncrease: 60000,
  maxDelay: 600000
};

let throughputTest = {
  type: 'throughput',
  width: 1,
  duration: 10000
};

program
  .usage('[options] <resultsFile>')
  .option(
    '-p, --provider <name>',
    'Serverless platform to target (amazon, ibm, microsoft, google)',
    name => config.provider.name = name)
  .option(
    '--project <name>',
    'Name of the project to deploy Google Cloud Functions to',
    name => config.provider.project = name)
  .option(
    '--credentials <path>',
    'Path of the file holding Google Cloud credentials',
    path => config.provider.credentials = path)
  .option(
    '-d, --duration <ms>',
    'Number of milliseconds the function should execute before returning',
    ms => config.function.duration = parseInt(ms))
  .option(
    '-l, --latency',
    'Runs a latency test on the specified provider',
    () => config.test = latencyTest)
  .option(
    '-t, --throughput',
    'Runs a throughput test on the specified provider',
    () => config.test = throughputTest)
  .option(
    '-i, --iterations <n>',
    'Number of times to run the test',
    n => config.test.iterations = parseInt(n))
  .parse(process.argv);

if (program.args.length > 0) {
  config.resultsFile = program.args[0];
  slsperf.run(config, output => {
    fs.writeFile(config.resultsFile, JSON.stringify(output, null, 4));
  });
}
