#!/usr/bin/env node
const path = require('path');
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');
const testOpenApiPaths = require('../lib');
const {
  DOCKER_TESTOSA_CONFIG_FILE_PATH,
  DOCKER_TESTOSA_OPEN_API_FILE_PATH
} = require('../lib/constants/config');
const createInitialConfigFile = require('../lib/create-initial-config-file');
const isDockerEnv = require('./helpers/is-docker-env');

const options = yargs(hideBin(process.argv))
  .array('excludedMethods')
  .array(['excludedStatusCodes'])
  .parse();
const { init } = options;
const isCli = true;

let configFilePath;

if (isDockerEnv()) {
  configFilePath = DOCKER_TESTOSA_CONFIG_FILE_PATH;
  options.openApiFilePath = DOCKER_TESTOSA_OPEN_API_FILE_PATH;

  testOpenApiPaths(options, isCli, configFilePath);
} else if (init) {
  createInitialConfigFile();
} else {
  configFilePath = path.resolve(process.cwd(), './testosa.config.json');
  testOpenApiPaths(options, isCli, configFilePath);
}
