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
  delayCallback: i => 60000 * (Math.floor((i - 1) / 5) + 1),
  maxDelay: 1800000
};

let throughputTest = {
  type: 'throughput',
  width: 15,
  duration: 10000,
};

let keepAliveTest = {
  type: 'latency',
  delayCallback: i => i ? 0 : 100,
  maxDelay: 101
};

program
  .usage('[options] <resultsDirectory>')
  .option(
    '-p, --provider <name>',
    'Serverless platform to target (amazon, ibm, microsoft, google, prototype)',
    name => config.provider.name = name == 'google' ? 'alphabet' : name)
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
    '-b, --backoff',
    'Runs a backoff test on the specified provider',
    () => config.test = latencyTest)
  .option(
    '-c, --concurrency',
    'Runs a concurrency test on the specified provider',
    () => config.test = throughputTest)
  .option(
    '-k, --keep-alive',
    'Runs a keep-alive test on the specified provider',
    () => config.test = keepAliveTest)
  .option(
    '-i, --iterations <n>',
    'Number of times to run the test',
    n => config.test.iterations = parseInt(n))
  .parse(process.argv);

config.resultsDir = program.args[0];

if (!fs.existsSync(config.resultsDir)) {
  fs.mkdirSync(config.resultsDir);
}

fs.writeFileSync(path.join(config.resultsDir, `${config.provider.name}_${config.test.type}_config.json`), JSON.stringify(config));

let iteration = 0;
fs.readdirSync(config.resultsDir).forEach(file => {
  if (file.match(/[a-z]+_[a-z]+_[0-9]+\.json/) != null) {
    let left = file.split('.')[0].split('_');
    if (left[0] == config.provider.name && left[1] == config.test.type) {
      let iterationFound = parseInt(left[2]);
      if (iterationFound >= iteration) {
        console.log(`Iteration ${iterationFound} already complete`);
        iteration = iterationFound + 1;
      }
    }
  }
});

if (iteration < config.test.iterations) {
  console.log(`Starting iteration ${iteration}`);
  slsperf.run(config, false, function processOutput(output) {
    let outputFile = path.join(config.resultsDir, `${config.provider.name}_${config.test.type}_${iteration}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 4));
    console.log(`Finished iteration ${iteration}`);
    if (++iteration < config.test.iterations) {
      console.log(`Starting iteration ${iteration}`);
      slsperf.run(config, true, processOutput);
    }
  });
}
