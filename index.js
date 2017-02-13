'use strict';

const fs = require('fs');

const stringify = require('csv-stringify');
const request = require('request');

const providers = require('./providers');

module.exports = function(provider, executionTime, requestTimes, iterations, concurrency, resultsFile) {
  let results = [["times"]];

  for (let i = 0; i < requestTimes.length; i++) {
    results[0][i + 1] = i + 1;
    results[i + 1] = [requestTimes[i]];
  }

  let remainingIterations = iterations;

  providers.prepareConcurrency(provider, concurrency, () => {
    let executeRound = (currentRound) => {
      providers.deploy(provider, concurrency, (uris) => {
        if (uris.length > remainingIterations) {
          uris = uris.slice(0, remaining);
        }

        let remainingInRound = uris.length;

        for (let i = 0; i < uris.length; i++) {
          let remainingInIteration = requestTimes.length;

          let delay = 3 * requestTimes.length * concurrency;
          let start = Date.now() + delay;

          for (let n = 0; n < requestTimes.length; n++) {
            setTimeout(
              (currentIteration) => request.post({
                url: uris[i],
                body: JSON.stringify({ duration: executionTime }),
                time: true
              }, (err, res, body) => {
                if (err) throw err;
                if (res.statusCode != 200) {
                  throw new Error('Unexpected response. Status code: ' + res.statusCode + '. Body: ' + body);
                }

                console.log(res.elapsedTime + 'ms');
                results[n + 1][currentRound * concurrency + currentIteration + 1] = {
                  responseTime: res.elapsedTime,
                  functionDuration: JSON.parse(body).duration
                };

                if (--remainingInIteration == 0) {
                  if (--remainingIterations == 0) {
                    stringify(results, (err, output) => {
                      if (err) throw err;
                      fs.writeFile(resultsFile, output);
                      providers.cleanupDeployment(provider);
                    });
                  } else if (--remainingInRound == 0) {
                    executeRound(currentRound + 1);
                  }
                }
              }),
              start + requestTimes[n] - Date.now(),
              i
            );
          }
        }
      });
    };
    executeRound(0);
  });
}
