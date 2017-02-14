# Serverless Performance

This package allows you to measure performance characteristics of serverless platforms such as AWS Lambda, Azure Functions, IBM OpenWhisk, and Google Cloud Functions.

Note: this project is not complete by any means, and support for some platforms is taken from active pull requests, proceed cautiously. If you encounter issues, please report them and they will be fixed promptly.

## Getting Started

### Install Serverless

The <a href='www.serverless.com'>Serverless Framework</a> is used as the deployment engine for this package. To install:

```bash
npm install -g serverless
```

### Configure Platforms

You must configure credentials before using any of the supported platforms:

* **AWS Lambda** can be configured by following this <a href='https://serverless.com/framework/docs/providers/aws/guide/credentials/'>guide</a> on the Serverless Framework documentation website.
* **IBM OpenWhisk** can be configured by following this <a href='https://serverless.com/framework/docs/providers/openwhisk/guide/credentials/'>guide</a> on the Serverless Framework documentation website.
* **Azure Functions** can be configured by setting environment variables as described <a href='https://github.com/serverless/serverless-azure-functions/tree/707855008fc688c954a2bf6dfc244b3296a66086'>here</a>.
* **Google Cloud Functions** can be configured by creating a `~/.gcloud/keyfile.json` file as described <a href='https://github.com/serverless/serverless-google-cloudfunctions/tree/1100f3439ce478f370366c65d73236e2a5b47cc0'>here</a>.

### Install Package

This package can be installed via npm:

```bash
npm install serverless-performance
```
