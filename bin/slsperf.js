#!/usr/bin/env node

const path = require('path');

const program = require('commander');

const slsperf = require(path.join(__dirname, '..'));

let config = {
  provider: {},
  function: {},
  test: {}
};

program
  .version('0.0.4')
  .usage('[options] <resultsFile>')
  .option(
    '-p, --provider <name>',
    'Serverless platform to target (amazon, ibm, microsoft, google)',
    name => config.provider.name = name)
  .option(
    '-d, --duration <ms>',
    'Number of milliseconds the function should execute before returning',
    ms => config.function.duration = parseInt(ms))
  .option(
    '-r, --rate <list>',
    'Describes the stages of the test; comma separated list of \'d@r\' pairs, where d is the duration of the stage in seconds, and r is the number of requests to execute per second; rate and backoff options are mutually exclusive',
    list => {
      stages = parseStages(list, 'duration', 'rate');
      config.test.timings = generateRateTimings(stages);
    }
  )
  .option(
    '-b, --backoff <list>',
    'Describes the stages of the test; comma separated list of \'n@s\' pairs, where n is the number of times to backoff, and s is the additional step time to wait between requests; backoff and rate options are mutually exclusive',
    list => {
      stages = parseStages(list, 'number', 'step');
      config.test.timings = generateBackoffTimings(stages);
    }
  )
  .option(
    '-i, --iterations <n>',
    'Number of times to run the test',
    n => config.test.iterations = parseInt(n)
  )
  .option(
    '-c, --concurrency <n>',
    'Number of test iterations to run at a time',
    n => config.test.concurrency = parseInt(n)
  )
  .parse(process.argv);

if (program.args.length > 0) {
  config.resultsFile = program.args[0];
  slsperf(config);
}

function parseStages(list, first, second) {
  let stages = [];
  list.split(',').forEach(pair => {
    let parts = pair.split('@');
    let stage = {};
    stage[first] = parseInt(parts[0]);
    stage[second] = parseInt(parts[1]);
    stages.push(stage);
  });
  return stages;
}

function generateRateTimings(stages) {
  let timings = [];
  let stageStart = 0;
  stages.forEach(stage => {
    let duration = stage.duration * 1000;
    let count = stage.duration * stage.rate;
    let period = Math.floor(duration / count);
    let extra = duration % count;
    let time;
    for (time = 0; time < duration; time += period) {
      if (extra++ >= count) time++;
      timings.push(time + stageStart);
    }
    stageStart = time;
  });
  return timings;
}

function generateBackoffTimings(stages) {
  let timings = [];
  let stageStart = 0;
  stages.forEach(stage => {
    let maximum = stage.number * stage.step;
    let time;
    for (time = 0; time < maximum; time += stage.step) {
      timings.push(time + stageStart);
    }
    stageStart = time;
  });
  return timings;
}