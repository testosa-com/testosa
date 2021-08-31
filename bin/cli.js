#!/usr/bin/env node
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');
const testOpenApiPaths = require('../lib');
const createInitialConfigFile = require('../lib/create-initial-config-file');

const { argv } = yargs(hideBin(process.argv));
const { init } = argv;
const isCli = true;

if (init) {
  createInitialConfigFile();
} else {
  testOpenApiPaths(argv, isCli);
}
