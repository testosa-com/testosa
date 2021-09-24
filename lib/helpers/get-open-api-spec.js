const fs = require('fs');
const swaggerParser = require('@apidevtools/swagger-parser');
const { logErrorAndTerminate } = require('./log');

const getOpenApiSpec = async (openApiFilePath) => {
  let resolveOpenApiSpec;
  let openApiSpec;

  try {
    const openApiSpecRaw = fs.readFileSync(openApiFilePath);
    openApiSpec = JSON.parse(openApiSpecRaw);

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
