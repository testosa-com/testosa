const fs = require('fs');
const path = require('path');
const swaggerParser = require('@apidevtools/swagger-parser');
const jsYaml = require('js-yaml');
const { logErrorAndTerminate } = require('./log');

const getOpenApiSpec = async (openApiFilePath) => {
  let resolveOpenApiSpec;
  let openApiSpec;

  try {
    const openApiSpecRaw = fs.readFileSync(openApiFilePath, 'utf8');
    const fileExtension = path.extname(openApiFilePath);

    openApiSpec = ['yml', 'yaml'].includes(fileExtension)
      ? jsYaml.load(openApiSpecRaw)
      : JSON.parse(openApiSpecRaw);

    resolveOpenApiSpec = await swaggerParser.validate(openApiSpec);
    const { openapi, swagger } = resolveOpenApiSpec;
    const specVersion = swagger || openapi || '';

    if (!specVersion.startsWith('3')) {
      logErrorAndTerminate(
        `Unsupported OpenAPI version: ${specVersion}. Testosa currently supports OpenAPI Specification version 3 or higher.`
      );
    }
  } catch (error) {
    logErrorAndTerminate(error.message);
  }

  return resolveOpenApiSpec;
};

module.exports = getOpenApiSpec;
