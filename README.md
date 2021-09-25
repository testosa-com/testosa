# Testosa
Fast, **auto-generated** end-to-end tests to validate your backend HTTP API using OpenAPI (formerly Swagger). Testosa reads your OpenAPI description and generate tests for each of your endpoints and responses defined in your API specification.

#### Features
- Quick install and initialization
- Automatic test generation
- Command-line interface
- Test hooks

## Table of Contents
1. [Contributing](#contributing)
2. [System Requirements](#system-requirements)
3. [Installation and Usage](#installation-and-usage)
   - [Install](#install)
   - [Usage: CLI tool (recommended)](#usage-cli-tool-recommended)
     - [Running with configuration file (recommended)](#running-with-configuration-file-recommended)
     - [Running with command line argument](#running-with-command-line-arguments)
   - [Usage: NPM module](#usage-npm-module)
4. [Configuration](#configuration)
   - [Options](#options)
5. [Hooks](#hooks)
   - [Usage](#usage)
   - [Methods reference](#methods-reference)
   - [Examples](#examples)

## Contributing
Read our [contributing guide](./CONTRIBUTING.md) to learn about our development process and to propose bugfixes and improvements.

## System Requirements
| Feature                    | Supported Technology  |
|----------------------------|-----------------------|
| API specification standard | OpenAPI 3.0           |
| CLI runtime                | Node.js 12 or higher  |
| Hooks language             | Node.js (JavaScript)  |
| Operating systems          | MacOS, Windows, Linux |

## Installation and Usage
### Install
The primary way of running Testosa is as a CLI tool. Here, you may install Testosa as a project dependency (recommended) or as a global module:
```shell
npm install testosa --save-dev
```
### Usage: CLI tool (recommended)

#### Running with configuration file (recommended)
1. Create your configuration:
   - When running Testosa using a configuration file, you may use its convenience initialization prompt. Testosa will ask a few questions and will create a basic configuration file at _./testosa.config.json_. You may later extend this config with additional options you need. Take a look at the [configuration section](#configuration) for all config options.
   ```shell
   ./node_modules/.bin/testosa --init
   ```
2. Start Testosa:
   ```shell
   ./node_modules/.bin/testosa
   ```

#### Running with command line arguments
Start Testosa with the desired options passed in through command line arguments:
```shell
./node_modules/.bin/testosa \
   --apiBaseUrl=<YOUR_API_BASE_URL> \
   --openApiFilePath=<PATH_TO_YOUR_OPEN_API_FILE>
```

> Note: if any option is declared in your configuration file AND as is also declared as a command line argument, the value for that option from the command line argument will take precedence.

### Usage: NPM module
Testosa may optionally be run as a `require`d or `import`ed module within a Node.js script or application:
 ```javascript
 const testosa = require('testosa');
 
 const config = {
   apiBaseUrl: '<YOUR_API_BASE_URL>',
   openApiFilePath: '<PATH_TO_YOUR_OPEN_API_FILE>',
   ...
 };
 testosa(config);
 ```

## Configuration
After running `testosa --init`, you'll have a `testosa.config.json` file in your directory. In it, you'll see some rules configured like this:

```json
{
   "apiBaseUrl": "<YOUR_API_BASE_URL>",
   "openApiFilePath": "<PATH_TO_YOUR_OPEN_API_FILE>"
}
```

### Options
#### apiBaseUrl [string] (required)
Base URL for the API server that you are validating your OpenAPI specification against.
- Format: URI

#### excludedMethods [array\<string\>]
An array of HTTP methods that should be skipped when generating tests. Testosa will not attempt to test any method + path combination that includes a method specified in this array.
- Allowed values: `DELETE`, `GET`, `OPTIONS`, `PATCH`, `POST`, `PUT`, `TRACE`

#### excludedStatusCodes [array\<integer\>]
An array of HTTP status codes that should be skipped when generating tests. Testosa will not attempt to test any status code + path combination that includes a status code specified in this array. This proves useful when it is difficult to reliably trigger certain status codes (eg. `5xx`);
- Allowed values: >= `200` and <= `599`

#### hooksFilePath [string]
If you're leveraging test hooks, include this option to specify the relative path to the JavaScript where your hooks are defined. See the [Hooks](#hooks) section for creating and using hooks.

#### openApiFilePath [string] (required)
The relative file path to your OpenAPI specification file.

## Hooks
Testosa provides a hooks interface to perform actions before and after all and/or each endpoint test. Hooks are currently only supported in JavaScript and are defined as a _module_ or _class_ that implements `afterAll`, `afterEach`, `beforeAll` and `beforeEach` methods that will be called when any of those events occurs.

### Usage
To start using hooks:
1. Create a JavaScript file with the hook functions you wish to use in your tests. Supported functions include `afterAll`, `afterEach`, `beforeAll` and `beforeEach`. See the [hooks functions reference](#reference) for details.
    ```javascript
    // path/to/your/hooks-file.js
    
    const afterAll = async () => { /* logic */ };
    const afterEach = async (transaction) => { /* logic */ };
    const beforeAll = async () => { /* logic */ };
    const beforeEach = async (transaction) => { /* logic */ };
    
    module.exports = {
      afterAll,
      afterEach,
      beforeAll,
      beforeEach
    }
    ```
3. Update your Testosa config to include the [`hooksFilePath`](#hooksfilepath-string) option and set it to the relative path of your hooks file.
4. Run Testosa

### Methods reference
#### `afterAll()`
Runs once after **all** tests have executed regardless of their success/failure status. This function takes no parameters and can be asynchronous if your logic requires it.

Typical use cases:
- Performing global teardown/clean up after your entire test run. For example:
  - deprovisioning your test database
  - deauthenticating mock users
  - deleting mock resources
  - etc.

#### `afterEach(transaction)`
Runs after **each** individual test has executed regardless of its success/failure state. The `afterEach()` function takes a single parameter, `transaction` containing details about the test.

> **Important**: Here, the `transaction` object is _read only_ and serves to provide details of the test after the fact. Modifying the transaction object in this hook will have no effect.

Typical use cases:
- Performing teardown/clean up after each test executes. For example:
  - deleting mock resources
  - deauthenticating mock users
  - debugging
  - etc.

#### `beforeAll()`
Runs once before **all** tests have executed. This function takes no parameters and can be asynchronous if your logic requires it.

Typical use cases:
- Performing global set up before your test run. For example:
  - provisioning your test database 
  - creating and authenticating mock users
  - seeding data in your database
  - etc.

#### `beforeEach(transaction)`
Runs before **each** individual test has executed. The `beforeEach()` function takes a single parameter, `transaction` containing details about the test.

> **Important**: With the exception of the sub-object `transaction.actual.request` and `transaction.skip`, all other properties in the `transaction` object are _read only_ and may not be modified.

Typical use cases:
- Performing set up before each test executes. For example:
  - creating mock resources before modifying or delete them in _update_ or _delete_ endpoint tests
  - replacing placeholder parameters (query, header, path etc.) placeholders with real values
  - skipping a specific test
  - updating the generated test request to trigger a negative scenario
  - debugging
  - etc.

### Examples
The following examples demonstrates the implementation of _some_ of the test hook use cases in a typical test run:

| Use case                                           | Hooks        |
|----------------------------------------------------|--------------|
| Create test database                               | `beforeAll`  |
| Create and authenticate a mock user to before all  | `beforeAll`  |
| Skip single test by operationId                    | `beforeEach` |
| Skip single test by HTTP method and path           | `beforeEach` |
| Create mock resource before modifying it           | `beforeEach` |
| Delete mock resource after test                    | `afterEach`  |
| Delete test user after all tests complete          | `afterAll`   |
| Destroy test database after all tests complete     | `afterAll`   |

```javascript
// path/to/your/hooks-file.js

const authenticateUser = require('../test-helpers/authenticate-user');
const createMockUser = require('../test-helpers/create-user');
const deleteMockUser = require('../test-helpers/delete-user');
const createMockVehicle = require('../test-helpers/create-vehicle');
const deleteMockVehicle = require('../test-helpers/delete-vehicle');
const createTestDb = require('../test-helpers/create-test-db');
const destroyTestDb = require('../test-helpers/destroy-test-db');

let accessToken;

const afterAll = async () => {
  // Destroy test database after all tests
  await destroyTestDb();
  
  // Delete mock user after all tests
  await deleteMockUser(accessToken);
};

const afterEach = async (transaction) => {
  // Delete mock vehicle resource
  if (transaction.expected.method === 'PUT' && transaction.expected.path === '/vehicles/{vehicleId}') {
    await deleteMockVehicle(accessToken);
  }
};

const beforeAll = async () => {
  // Create mock database before starting all tests
  await createTestDb();
  
  // Create and authenticate a mock user to be used for all authenticated requests
  const userName = 'mock-user@my-domain.com';
  const password = 's3cret!123';
  await createMockUser(userName, password);
  accessToken = authenticateUser(userName, password);
};

const beforeEach = async (transaction) => {
  // Skip test identified by "get-users" operationId with status code 200
  if (transaction.operationId === 'get-users' && transaction.expectedStatusCode === 200) {
    transaction.skip = true;
  }
  
  // Skip all tests under the PUT /users path definition
  if (transaction.expected.method === 'PUT' && transaction.expected.path === '/users') {
    transaction.skip = true;
  }

  // Create mock resource before updating it
  if (transaction.expected.method === 'PUT' && transaction.expected.path === '/vehicles/{vehicleId}') {
    const vehicle = await createMockVehicle(accessToken);
    transaction.expected.path = transaction.expected.path.replace('{vehicleId}', vehicle.id)
  }
  
  return transaction;
};

module.exports = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach
}
```
