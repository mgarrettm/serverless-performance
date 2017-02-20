'use strict';

const fs = require('fs');

const request = require('request');

const providers = require('./providers');

function run(config, verifyRemoval, callback) {
  providers.removeFunctions(config.provider, removeCode => {
    if (verifyRemoval && removeCode != 0) {
      throw new Error('Function removal failed with code ' + removeCode);
    }

    providers.deployFunctions(config.provider, (deployCode, uri) => {
      if (deployCode != 0) {
        throw new Error('Function deployment failed with code ' + deployCode);
      }

      switch (config.test.type) {
        case 'latency':
          executeLatencyTest(
            [],
            config.test.delay,
            config.test.delayIncrease,
            config.test.maxDelay,
            config.function.duration,
            uri,
            callback);
          break;
        case 'throughput':
          executeThroughputTest(
            [],
            1,
            config.test.width,
            config.test.duration,
            config.function.duration,
            uri,
            callback);
          break;
      }
    });
  });
}

function executeLatencyTest(results, delay, delayIncrease, maxDelay, functionDuration, uri, callback) {
  if (delay > maxDelay) {
    callback(results);
    return;
  }

  executeFunction(uri, functionDuration, result => {
    results.delay = delay;
    results.push(result);

    setTimeout(
      executeLatencyTest,
      delay,
      results, delay + delayIncrease, delayIncrease, maxDelay, uri, functionDuration, callback);
  });
}

function executeThroughputTest(results, currentWidth, maxWidth, testDuration, functionDuration, uri, callback) {
  if (currentWidth > maxWidth) {
    callback(results);
    return;
  }

  let startTime = null;
  let stageCompleted = false;

  for (let i = 0; i < currentWidth; i++) {
    executeFunction(uri, functionDuration, function processResult(result) {
      if (startTime == null) {
        startTime = Date.now();
      }

      results.push(result);

      if (Date.now() - startTime > testDuration) {
        if (!stageCompleted) {
          stageCompleted = true;

          executeThroughputTest(
            results,
            currentWidth + 1,
            maxWidth,
            testDuration,
            functionDuration,
            uri,
            callback);
        }
      } else {
        executeFunction(uri, functionDuration, processResult);
      }
    });
  }
}

function executeFunction(uri, duration, callback) {
  request.post({
    url: uri,
    body: JSON.stringify({ duration: duration }),
    headers: { 'Content-Type': 'application/json' },
    time: true
  }, (err, res, body) => {
    if (err) throw err;
    if (res.statusCode != 200) {
      throw new Error('Unexpected response. Status code: ' + res.statusCode + '. Body: ' + body);
    }

    let parsedBody = JSON.parse(body);
    let overhead = res.elapsedTime - parsedBody.duration;

    console.log(overhead + 'ms');

    callback({
      executionOverhead: overhead,
      requestStart: res.request.startTime,
      requestDuration: res.elapsedTime,
      functionDuration: parsedBody.duration,
      instanceId: parsedBody.id
    });
  });
}

module.exports = {
  run: run
};
