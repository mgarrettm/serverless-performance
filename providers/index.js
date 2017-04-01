// TODO: have you ever heard of promises?
// TODO: better way to call serverless? not exec?

'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const urlRegex = require('url-regex');
const YAML = require('yamljs');

const serverlessPath = path.join(require.resolve('serverless'), '../../bin/serverless');

let env = Object.create(process.env);
env.SLS_IGNORE_WARNING = '*';
env.SLS_DEBUG = '*';

function prepareFunctions(provider, callback) {
  let ymlPath = path.join(__dirname, provider.name, 'serverless.yml');
  
  YAML.load(ymlPath, yml => {
    yml = modifyYAML(provider, yml);

    let ymlString = YAML.stringify(yml, null, 4);

    fs.writeFile(ymlPath, ymlString, err => {
      if (err) throw err;
      callback();
    });
  });
}

function deployFunctions(provider, callback) {
  let deploymentPath = path.join(__dirname, provider.name);

  let child = exec('cd ' + deploymentPath + '&& node ' + serverlessPath + ' deploy', { env: env });

  let stdout = '';
  child.stdout.on('data', data => {
    stdout += data;
    process.stdout.write(data);
  });

  child.stderr.on('data', data => process.stderr.write(data));

  child.on('close', code => {
    let uri = [];
    if (code == 0) {
      uri = extractUri(provider, stdout.match(urlRegex()));
    }

    callback(code, uri);
  });
}

function removeFunctions(provider, callback) {
  let deploymentPath = path.join(__dirname, provider.name);

  let child = exec('cd ' + deploymentPath + '&& node ' + serverlessPath + ' remove', { env: env });

  child.stdout.on('data', data => process.stdout.write(data));
  child.stderr.on('data', data => process.stderr.write(data));

  child.on('close', code => {
    callback(code);
  })
}

function modifyYAML(provider, yml) {
  switch(provider.name) {
    case 'alphabet':
      provider.project = provider.project || generateRandomLetters(12);
      yml.provider.project = provider.project;
      provider.credentials = provider.credentials || '~/.gcloud/keyfile.json';
      yml.provider.credentials = provider.credentials;
      break;
    case 'microsoft':
      provider.service = provider.service || generateRandomLetters(12);
      yml.service = provider.service;
      break;
  }

  yml.functions = generateFunctions(provider);

  return yml;
}

function generateFunctions(provider) {
  let functions = {};
  
  let functionName = 'test';
  if (provider.name == 'amazon') {
    functionName += '-' + generateRandomLetters(6);
  }

  switch(provider.name) {
    case 'alphabet':
      functions[functionName] = {
        handler: 'test',
        availableMemoryMb: 512,
        events: [{
          http: '/' 
        }]
      };
      break;
    case 'amazon':
      functions[functionName] = {
        handler: 'handler.test',
        events: [{
          http: {
            path: '/test',
            method: 'post',
            private: false
          }
        }]
      };
      break;
    case 'ibm':
      functions[functionName] = {
        handler: 'handler.test',
        memory: 512,
        events: [{
          http: 'POST test'
        }]
      };
      break;
    case 'microsoft':
      functions[functionName] = {
        handler: 'handler.test',
        events: [{
          http: true,
          'x-azure-settings': {
            authLevel: 'anonymous'
          }
        }]
      };
      break;
    case 'prototype':
      functions[functionName] = {
        handler: 'index.js',
        memorySize: 512
      };
      break;
  }

  return functions;
}

function extractUri(provider, uris) {
  switch (provider.name) {
    case 'microsoft':
      return 'http://' + provider.service + '.azurewebsites.net/api/test';
    default:
      return uris[0];
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

module.exports = {
  prepareFunctions: prepareFunctions,
  deployFunctions: deployFunctions,
  removeFunctions: removeFunctions
};