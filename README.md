# Serverless Performance

This package allows you to measure performance characteristics of serverless platforms such as AWS Lambda, Azure Functions, Google Cloud Functions, and IBM OpenWhisk.

The <a href='http://www.serverless.com'>Serverless Framework</a> is used as the deployment engine for this package.

Note: this project is in its early stages, proceed cautiously. If you encounter issues, please report them and they will be fixed promptly.

## Getting Started

### Install Package

This package can be installed via npm:

```bash
npm install serverless-performance
```

### Configure Platforms

You must configure credentials before using any of the supported platforms:

* **AWS Lambda** can be configured by following this <a href='https://serverless.com/framework/docs/providers/aws/guide/credentials/'>guide</a> on the Serverless Framework website.
* **IBM OpenWhisk** can be configured by following this <a href='https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/'>guide</a> on the Serverless Framework website.
* **Azure Functions** can be configured by following this <a href='https://serverless.com/framework/docs/providers/azure/guide/credentials/'>guide</a> on the Serverless Framework website.
* **Google Cloud Functions** can be configured by creating a `keyfile.json` file as described <a href='https://github.com/serverless/serverless-google-cloudfunctions'>here</a>.

### Command Line Interface

A command line tool for this package is available at `bin/slsperf.js`:

```
Usage: slsperf [options] <resultsFile>

Options:

    -h, --help             output usage information
    -p, --provider <name>  Serverless platform to target (amazon, ibm, microsoft, google, prototype)
    --project <name>       Name of the project to deploy Google Cloud Functions to
    --credentials <path>   Path of the file holding Google Cloud credentials
    -d, --duration <ms>    Number of milliseconds the function should execute before returning
    -l, --latency          Runs a latency test on the specified provider
    -t, --throughput       Runs a throughput test on the specified provider
    -k, --keep-alive       Runs a keep-alive test on the specified provider
    -i, --iterations <n>   Number of times to run the test

Examples:

    node slsperf.js -p amazon -d 0 -t -i 1 .
```