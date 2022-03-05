const fs = require('fs');
const path = require('path');
const swaggerParser = require('@apidevtools/swagger-parser');
const chance = require('chance').Chance();
const jsYaml = require('js-yaml');
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
  let pathExtnameSpy;
  let jsYamlLoadSpy;
  let processExitSpy;

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

    fsReadFileSyncSpy = jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation(() => JSON.stringify(unresolvedSpec));

    pathExtnameSpy = jest.spyOn(path, 'extname').mockImplementation(() => {});
    jsYamlLoadSpy = jest.spyOn(jsYaml, 'load').mockImplementation(() => {});

    swaggerParserValidateSpy = jest
      .spyOn(swaggerParser, 'validate')
      .mockImplementation(async () => unresolvedSpec);

    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    pathExtnameSpy.mockReset();
    jsYamlLoadSpy.mockReset();
    processExitSpy.mockReset();
  });

  it('should return a resolved deserialized JSON OpenAPI spec', async () => {
    resolvedSpec = await getOpenApiSpecSpec(openApiFilePath);

    expect(jsYamlLoadSpy).not.toHaveBeenCalled();
    expect(logErrorAndTerminate).not.toHaveBeenCalled();
    expect(resolvedSpec).toStrictEqual(unresolvedSpec);
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  // eslint-disable-next-line
  ['yml', 'yaml'].forEach((extension) => {
    it(`should parse the file as YAML if the extension is ${extension}`, async () => {
      pathExtnameSpy.mockImplementation(() => extension);
      resolvedSpec = await getOpenApiSpecSpec(openApiFilePath);

      expect(jsYamlLoadSpy).toHaveBeenCalledWith(expect.any(String));
      expect(logErrorAndTerminate).not.toHaveBeenCalled();
      expect(resolvedSpec).toStrictEqual(unresolvedSpec);
      expect(processExitSpy).not.toHaveBeenCalled();
    });
  });

  it('should log an error and terminate if the OpenApi version is not 3', async () => {
    delete unresolvedSpec.openapi;
    unresolvedSpec.swagger = '2.0.0';
    fsReadFileSyncSpy.mockImplementation(() => JSON.stringify(unresolvedSpec));
    swaggerParserValidateSpy.mockImplementation(async () => unresolvedSpec);

    await getOpenApiSpecSpec(openApiFilePath);

    expect(jsYamlLoadSpy).not.toHaveBeenCalled();
    expect(logErrorAndTerminate).toHaveBeenCalledWith(expect.any(String));
    expect(processExitSpy).not.toHaveBeenCalled();
  });

  it('should log an error and terminate if the OpenApi spec is invalid', async () => {
    delete unresolvedSpec.info;
    delete unresolvedSpec.paths;
    fsReadFileSyncSpy.mockImplementation(() => JSON.stringify(unresolvedSpec));
    swaggerParserValidateSpy.mockImplementation(
      async () => new Error('Invalid OpenApi spec')
    );

    await getOpenApiSpecSpec(openApiFilePath);

    expect(jsYamlLoadSpy).not.toHaveBeenCalled();
    expect(logErrorAndTerminate).toHaveBeenCalledWith(expect.any(String));
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});
