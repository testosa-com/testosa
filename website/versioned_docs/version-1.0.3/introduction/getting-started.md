---
sidebar_position: 1
---

# Getting Started

## What is Testosa?
Testosa is a Node.js based testing framework that enables quick validation of your OpenAPI contract.

#### How it works - Testosa:
1. Reads your OpenAPI description and generates tests for each request path + method + response status code you have defined
2. Generates and fuzzes mock data in the request body, header, path and query params from your request schemas
   - If present, example values are leveraged from your OpenAPI spec
3. Triggers real calls to your API using generated mock data
4. Validates your API response against the expected schema

Optionally, Testosa's hooks interface enables inserting, saving and reusing data in running tests. See our [Hooks](/docs/introduction/hooks) for more details.

## Usage: CLI tool (recommended)

### Running with configuration file (recommended)
1. Create your configuration:

  When running Testosa using a configuration file, you may use its convenience initialization prompt. Testosa will ask a few questions and will create a basic configuration file at _./testosa.config.json_. You may later extend this config with additional options you need. Take a look at the [configuration section](/docs/introduction/configuration) for all config options.
  ```shell
  npm install testosa --save-dev
  
  ./node_modules/.bin/testosa --init
  ```
4. Start Testosa:
   ```shell
   ./node_modules/.bin/testosa
   ```

### Running with command line arguments
Start Testosa with the desired options passed in through command line arguments:
```shell
npm install testosa --save-dev

./node_modules/.bin/testosa \
  --apiBaseUrl=<YOUR_API_BASE_URL> \
  --openApiFilePath=<PATH_TO_YOUR_OPEN_API_FILE>
```

:::info
If any option is declared in your configuration file AND as is also declared as a command line argument, the value for that option from the command line argument will take precedence.
:::

## Usage: NPM module
You may opt to run Testosa as a `require`d or `import`ed module within a Node.js script or application. After installing it:
```shell
npm install testosa --save-dev
```

you can `require` it directly in your JavaScript program and use it like this:

 ```javascript
 const testosa = require('testosa');
 
 const config = {
   apiBaseUrl: '<YOUR_API_BASE_URL>',
   openApiFilePath: '<PATH_TO_YOUR_OPEN_API_FILE>',
   ...
 };
 testosa(config);
 ```

_______________________

## System Requirements

| Feature                    | Supported Technology  |
|----------------------------|-----------------------|
| API specification standard | OpenAPI 3.0           |
| CLI runtime                | Node.js 12 or higher  |
| Hooks language             | Node.js (JavaScript)  |
| Operating systems          | MacOS, Windows, Linux |
