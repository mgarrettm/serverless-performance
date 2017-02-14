# Serverless Performance

This package allows you to measure performance characteristics of serverless platforms such as AWS Lambda, Azure Functions, IBM OpenWhisk, and Google Cloud Functions.

Note: this project is not complete by any means, and support for some platforms is taken from active pull requests, proceed cautiously. If you encounter issues, please report them and they will be fixed promptly.

## Getting Started

### Install Serverless

The <a href='http://www.serverless.com'>Serverless Framework</a> is used as the deployment engine for this package. To install:

```bash
npm install -g serverless
```

### Install Package

This package can be installed via npm:

```bash
npm install serverless-performance
```

### Configure Platforms

You must configure credentials before using any of the supported platforms:

* **AWS Lambda** can be configured by following this <a href='https://serverless.com/framework/docs/providers/aws/guide/credentials/'>guide</a> on the Serverless Framework website.
* **IBM OpenWhisk** can be configured by following this <a href='https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/'>guide</a> on the Serverless Framework website.
* **Azure Functions** can be configured by setting environment variables as described <a href='https://github.com/serverless/serverless-azure-functions/tree/707855008fc688c954a2bf6dfc244b3296a66086'>here</a>.
* **Google Cloud Functions** can be configured by creating a `keyfile.json` file as described <a href='https://github.com/serverless/serverless-google-cloudfunctions/tree/1100f3439ce478f370366c65d73236e2a5b47cc0'>here</a>.

### Command Line Interface

A command line tool for this package is available at `bin/slsperf.js':

```
Usage: slsperf [options] <resultsFile>

Options:

  -h, --help             output usage information
  -V, --version          output the version number
  -p, --provider <name>  Serverless platform to target (amazon, ibm, microsoft, google)
  --project <name>       Name of the project to deploy Google Cloud Functions to
  --credentials <path>   Path of the file holding Google Cloud credentials
  --service <name>       Name of the App Service project to deploy Azure Functions to
  -d, --duration <ms>    Number of milliseconds the function should execute before returning
  -r, --rate <list>      Describes the stages of the test; comma separated list of 'd@r' pairs, where d is the duration of the stage in seconds, and r is the number of requests to execute per second; rate and backoff options are mutually exclusive
  -b, --backoff <list>   Describes the stages of the test; comma separated list of 'n@s' pairs, where n is the number of times to backoff, and s is the additional step time to wait between requests; backoff and rate options are mutually exclusive
  -i, --iterations <n>   Number of times to run the test
  -c, --concurrency <n>  Number of test iterations to run at a time
```
