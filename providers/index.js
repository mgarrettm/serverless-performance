// TODO: have you ever heard of classes? or promises?
// TODO: better way to call serverless binary?
// TODO: pass sls ignore warn into env vars

'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const urlRegex = require('url-regex');
const YAML = require('yamljs');

const serverlessPath = path.join(require.resolve('serverless'), '../../bin/serverless');

let service = '';

module.exports = {
  prepareConcurrency: (config, callback) => {
    let functions = {};

    for (var i = 0; i < config.test.concurrency; i++) {
      // Remove after AWS deploys fix to CloudLog
      let functionName = 'test' + i;
      if (config.provider.name == 'amazon') {
        functionName += '-' + generateRandomLetters(6);
      }
      functions[functionName] = generateFunction(config, i);
    }

    let ymlPath = path.join(__dirname, config.provider.name, 'serverless.yml');
    
    YAML.load(ymlPath, yml => {
      yml.functions = functions;
      yml = prepareYAML(config, yml);

      let ymlString = YAML.stringify(yml, null, 4);

      fs.writeFile(ymlPath, ymlString, err => {
        if (err) throw err;
        callback();
      });
    });
  },
  deploy: (config, callback) => {
    console.log('Beginning deployment to ' + config.provider.name);

    let deploymentPath = path.join(__dirname, config.provider.name);
    let remove = exec('cd ' + deploymentPath + '&& node ' + serverlessPath + ' remove');

    remove.stdout.on('data', data => process.stdout.write(data));

    remove.on('close', code => {
      let deploy = exec('cd ' + deploymentPath + '&& node ' + serverlessPath + ' deploy');

      let stdout = '';
      deploy.stdout.on('data', data => {
        stdout += data;
        process.stdout.write(data);
      });

      deploy.stderr.on('data', data => process.stderr.write(data));

      deploy.on('close', code => {
        if (code != 0) {
          throw new Error('Provider deployment exited with failure code: ' + code);
        }

        let uris = extractUris(config, stdout.match(urlRegex()));

        console.log('Finished deployment to ' + config.provider.name);

        callback(uris);
      });
    });
  },
  cleanupDeployment: (config) => {
    console.log('Beginning ' + config.provider.name + ' deployment cleanup');

    let deploymentPath = path.join(__dirname, config.provider.name);
    let child = exec('cd ' + deploymentPath + '&& node ' + serverlessPath + ' remove');

    child.stdout.on('data', data => process.stdout.write(data));

    child.stderr.on('data', data => process.stderr.write(data));

    child.on('close', code => {
      if (code != 0) {
        throw new Error('Provider deployment cleanup exited with failure code: ' + code);
      }

      console.log('Finished ' + config.provider.name + ' deployment cleanup');
    });
  }
};

function prepareYAML(config, yml) {
  switch(config.provider.name) {
    case 'alphabet':
      config.provider.project = config.provider.project || generateRandomLetters(12);
      yml.provider.project = config.provider.project;
      config.provider.credentials = config.provider.credentials || '~/.gcloud/keyfile.json';
      yml.provider.credentials = config.provider.credentials;
      break;
    case 'microsoft':
      config.provider.service = config.provider.service || generateRandomLetters(12);
      yml.service = config.provider.service;
      break;
  }
  return yml;
}

function generateFunction(config, index) {
  switch(config.provider.name) {
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
            path: '/test' + index,
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

function extractUris(config, uris) {
  switch (config.provider.name) {
    case 'microsoft':
      uris = [];
      let uri = 'http://' + config.provider.service + '.azurewebsites.net/api';
      for (let i = 0; i < config.test.concurrency; i++) {
        uris[i] = uri + '/test' + i;
      }
      return uris;
    default:
      return uris;
  }
}

function generateRandomLetters(length)
{
    let possibilities = "abcdefghijklmnopqrstuvwxyz";
    let text = "";
    for(let i = 0; i < length; i++) {
        text += possibilities.charAt(Math.floor(Math.random() * possibilities.length));
    }
    return text;
}
