'use strict';

const fs = require('fs');

const request = require('request');

const providers = require('./providers');

module.exports = function(config) {
  let output = {
    options: config,
    results: []
  };

  let remainingIterations = config.test.iterations;
  let instanceIds = {};

  providers.prepareConcurrency(config, () => {
    let executeRound = (currentRound) => {
      providers.deploy(config, (uris) => {
        if (uris.length > remainingIterations) {
          uris = uris.slice(0, remainingIterations);
        }

        let remainingInRound = uris.length;

        for (let i = 0; i < uris.length; i++) {
          output.results[i] = [];
          let remainingInIteration = config.test.timings.length;

          let delay = 3 * config.test.timings.length * config.test.concurrency;
          let start = Date.now() + delay;

          for (let n = 0; n < config.test.timings.length; n++) {
            setTimeout(
              (currentIteration) => request.post({
                url: uris[i],
                body: JSON.stringify({ duration: config.function.duration }),
                time: true
              }, (err, res, body) => {
                if (err) throw err;
                if (res.statusCode != 200) {
                  throw new Error('Unexpected response. Status code: ' + res.statusCode + '. Body: ' + body);
                }

                let parsedBody = JSON.parse(body);
                if (parsedBody.id in instanceIds && instanceIds[parsedBody.id] !== currentIteration) {
                  throw new Error('Function id mismatch in ' + currentIteration + ': ' + parsedBody.id);
                }
                instanceIds[parsedBody.id] = currentIteration;

                let overhead = res.elapsedTime - parsedBody.duration;
                console.log(overhead + 'ms');

                output.results[currentIteration][n] = {
                  executionOverhead: overhead,
                  functionDuration: parsedBody.duration,
                  instanceId: parsedBody.id
                };

                if (--remainingInIteration == 0) {
                  console.log('Finished iteration ' + currentIteration);

                  if (--remainingIterations == 0) {
                    fs.writeFile(config.resultsFile, JSON.stringify(output, null, 4));
                    providers.cleanupDeployment(config);
                  } else if (--remainingInRound == 0) {
                    executeRound(currentRound + 1);
                  }
                }
              }),
              start + config.test.timings[n] - Date.now(),
              currentRound * config.test.concurrency + i
            );
          }
        }
      });
    };
    executeRound(0);
  });
}
