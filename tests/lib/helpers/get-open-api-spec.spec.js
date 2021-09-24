const fs = require('fs');
const swaggerParser = require('@apidevtools/swagger-parser');
const chance = require('chance').Chance();
const getOpenApiSpecSpec = require('../../../lib/helpers/get-open-api-spec');
const { logErrorAndTerminate } = require('../../../lib/helpers/log');
const generateSpecName = require('../../__helpers/generate-spec-name');

jest.mock('@apidevtools/swagger-parser');
jest.mock('../../../lib/helpers/log');

describe(generateSpecName(), () => {
  let fsReadFileSyncSpy;
  let swaggerParserValidateSpy;
  let openApiFilePath;
  let unresolvedSpec;
  let resolvedSpec;

  beforeEach(() => {
    openApiFilePath = chance.string();
    unresolvedSpec = {
      info: {
        title: 'Test Spec'
      },
      openapi: '3.0.0',
      paths: {
        '/mock-path': {
          get: {}
        }
      }
    };
    resolvedSpec = undefined;

    fsReadFileSyncSpy = jest.spyOn(fs, 'readFileSync');
    fsReadFileSyncSpy.mockImplementation(() => JSON.stringify(unresolvedSpec));

    swaggerParserValidateSpy = jest.spyOn(swaggerParser, 'validate');
    swaggerParserValidateSpy.mockImplementation(async () => unresolvedSpec);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return a resolved deserialized JSON OpenAPI spec', async () => {
    resolvedSpec = await getOpenApiSpecSpec(openApiFilePath);

    expect(logErrorAndTerminate).not.toHaveBeenCalled();
    expect(resolvedSpec).toStrictEqual(unresolvedSpec);
  });

  it('should log an error and terminate if the OpenApi version is not 3', async () => {
    delete unresolvedSpec.openapi;
    unresolvedSpec.swagger = '2.0.0';
    fsReadFileSyncSpy.mockImplementation(() => JSON.stringify(unresolvedSpec));
    swaggerParserValidateSpy.mockImplementation(async () => unresolvedSpec);

    await getOpenApiSpecSpec(openApiFilePath);

    expect(logErrorAndTerminate).toHaveBeenCalledWith(expect.any(String));
  });

  it('should log an error and terminate if the OpenApi spec is invalid', async () => {
    delete unresolvedSpec.info;
    delete unresolvedSpec.paths;
    fsReadFileSyncSpy.mockImplementation(() => JSON.stringify(unresolvedSpec));
    swaggerParserValidateSpy.mockImplementation(
      async () => new Error('Invalid OpenApi spec')
    );

    await getOpenApiSpecSpec(openApiFilePath);

    expect(logErrorAndTerminate).toHaveBeenCalledWith(expect.any(String));
  });
});
