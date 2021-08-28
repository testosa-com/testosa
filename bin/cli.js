#!/usr/bin/env node
const { hideBin } = require('yargs/helpers');
const yargs = require('yargs/yargs');
const testOpenApiPaths = require('../lib');

const { argv } = yargs(hideBin(process.argv));

testOpenApiPaths(argv);
