'use strict';

const exec = require('child_process').exec;
const fs = require('fs');

const urlRegex = require('url-regex');
const YAML = require('yamljs');

let service = '';

module.exports = {
  prepareConcurrency: (provider, concurrency, callback) => {
    let functions = {};

    for (var i = 0; i < concurrency; i++) {
      functions['test' + i] = generateFunction(provider, i);
    }

    YAML.load('providers/' + provider + '/serverless.yml', configuration => {
      configuration.functions = functions;

      if (provider == 'microsoft') {
        service = generateResourceGroup();
        configuration.service = service;
      }

      let configurationString = YAML.stringify(configuration, null, 4);

      fs.writeFile('providers/' + provider + '/serverless.yml', configurationString, err => {
        if (err) throw err;
        
        callback();
      })
    });
  },
  deploy: (provider, concurrency, callback) => {
    console.log('Beginning deployment to ' + provider);

    let child = exec('cd providers/' + provider + '&& serverless remove & serverless deploy');

    let stdout = '';
    child.stdout.on('data', data => {
      stdout += data;
      process.stdout.write(data);
    });

    child.stderr.on('data', data => process.stderr.write(data));

    child.on('close', code => {
      if (code != 0) {
        throw new Error('Provider deployment exited with failure code: ' + code);
      }

      let uris = extractUris(provider, concurrency, stdout.match(urlRegex()));

      console.log('Finished deployment to ' + provider);

      callback(uris);
    });
  },
  cleanupDeployment: (provider) => {
    console.log('Beginning ' + provider + ' deployment cleanup');

    let child = exec('cd providers/' + provider + '&& serverless remove');

    child.stdout.on('data', data => process.stdout.write(data));

    child.stderr.on('data', data => process.stderr.write(data));

    child.on('close', code => {
      if (code != 0) {
        throw new Error('Provider deployment cleanup exited with failure code: ' + code);
      }

      console.log('Finished ' + provider + ' deployment cleanup');
    });
  }
};

function generateResourceGroup()
{
    let text = "";
    let possible = "abcdefghijklmnopqrstuvwxyz";

    for(let i = 0; i < 12; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

function generateFunction(provider, index) {
  switch(provider) {
    case 'alphabet':
      return {
        handler: 'test',
        availableMemoryMb: 512,
        events: [{
          http: true 
        }]
      };
    case 'amazon':
      return {
        handler: 'handler.test',
        events: [{
          http: {
            path: '/',
            method: 'post',
            private: false
          }
        }]
      };
    case 'ibm':
      return {
        handler: 'handler.test',
        memory: 512,
        events: [{
          http: 'POST test' + index
        }]
      };
    case 'microsoft':
      return {
        handler: 'handler.test',
        events: [{
          http: true,
          'x-azure-settings': {
            authLevel: 'anonymous'
          }
        }]
      };
  }
}

function extractUris(provider, concurrency, uris) {
  let uri = '';
  switch (provider) {
    case 'ibm':
      uri = uris[0];
      for (let i = 0; i < concurrency; i++) {
        uris[i] = uri + '/test' + i;
      }
      return uris;
    case 'microsoft':
      uris = [];
      uri = 'http://' + service + '.azurewebsites.net/api';
      for (let i = 0; i < concurrency; i++) {
        uris[i] = uri + '/test' + i;
      }
      return uris;
    default:
      return uris;
  }
}
