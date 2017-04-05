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
* **Prototype Platform** also compatible with a new <a href='https://github.com/mgarrettm/serverless-prototype'>prototype platform</a> using a `prototypeServiceBaseUri` environment variable.

### Command Line Interface

A command line tool for this package is available at `bin/slsperf.js`:

```
Usage: slsperf [options] <resultsDirectory>

Options:

    -h, --help             output usage information
    -p, --provider <name>  Serverless platform to target (amazon, ibm, microsoft, google, prototype)
    --project <name>       Name of the project to deploy Google Cloud Functions to
    --credentials <path>   Path of the file holding Google Cloud credentials
    -d, --duration <ms>    Number of milliseconds the function should execute before returning
    -b, --backoff          Runs a backoff test on the specified provider
    -c, --concurrency      Runs a concurrency test on the specified provider
    -k, --keep-alive       Maintains an invocation call to the specified provider
    -i, --iterations <n>   Number of times to run the test

Examples:

    node slsperf.js -p amazon -d 0 -c -i 1 .
```

## Example Results

The following are example results of running the performance tool on various serverless platforms. Details of the experimental setup can be found <a href='https://mgarrettm.blob.core.windows.net/research/prototype.pdf'>here</a>.

### Concurrency Test

<p align="center">
  <img align="center" src="https://mgarrettm.blob.core.windows.net/research/throughput.png" alt="Concurrency Test Results" />
</p>

The concurrency test is designed to measure the ability of serverless platforms to performantly scale and execute a function. The tool maintains invocation calls to the test function by reissuing each request immediately after receiving the response from the previous call. The test begins by maintaining a single invocation call in this way, and every 10 seconds adds an additional concurrent call, up to a maximum of 15 concurrent requests to the test function.

### Backoff Test

<p align="center">
  <img align="center" src="https://mgarrettm.blob.core.windows.net/research/latency.png" alt="Backoff Test Results" />
</p>

The backoff test is designed to study the cold start times and expiration behaviors of function instances in the various platforms. The backoff test sends single invocation call to the test function at increasing intervals, ranging from one to thirty minutes.
