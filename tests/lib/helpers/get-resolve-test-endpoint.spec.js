const chance = require('chance').Chance();
const getResolveTestEndpoint = require('../../../lib/helpers/get-resolved-test-endpoint');
const getTestDataValueFromSchema = require('../../../lib/helpers/get-test-data-value-from-schema');
const generateSpecName = require('../../__helpers/generate-spec-name');

jest.mock('../../../lib/helpers/get-test-data-value-from-schema');

describe(generateSpecName(), () => {
  let paramName;
  let paramDefaultValue;
  let paramLocation;
  let endpoint;
  let pathLevelParamsSpecs;
  let resolvedEndpoint;

  beforeEach(() => {
    paramName = 'mockId';
    paramDefaultValue = chance.string({
      alpha: true,
      casing: 'lower'
    });
    endpoint = undefined;
    resolvedEndpoint = undefined;

    pathLevelParamsSpecs = {
      name: paramName,
      required: true,
      schema: {
        default: paramDefaultValue,
        example: paramDefaultValue,
        type: 'string'
      }
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return endpoint with resolved URL param(s) from spec', () => {
    paramLocation = 'path';
    pathLevelParamsSpecs.in = paramLocation;
    endpoint = `/{${paramName}}/mock-endpoint`;
    getTestDataValueFromSchema.mockImplementation(() => paramDefaultValue);
    resolvedEndpoint = getResolveTestEndpoint(endpoint, pathLevelParamsSpecs);
    const expectedEndpoint = `/${paramDefaultValue}/mock-endpoint`;

    expect(resolvedEndpoint).toStrictEqual(expectedEndpoint);
  });

  it('should return endpoint with resolved query param(s) from spec', () => {
    paramLocation = 'query';
    pathLevelParamsSpecs.in = paramLocation;
    endpoint = '/mock-endpoint';
    getTestDataValueFromSchema.mockImplementation(() => paramDefaultValue);
    resolvedEndpoint = getResolveTestEndpoint(endpoint, pathLevelParamsSpecs);
    const expectedEndpoint = `${endpoint}?${paramName}=${paramDefaultValue}`;

    expect(resolvedEndpoint).toStrictEqual(expectedEndpoint);
  });

  it('should not set the query parameter if the parameter is not required', () => {
    paramLocation = 'query';
    pathLevelParamsSpecs.in = paramLocation;
    pathLevelParamsSpecs.required = false;
    endpoint = '/mock-endpoint';
    resolvedEndpoint = getResolveTestEndpoint(endpoint, pathLevelParamsSpecs);

    expect(resolvedEndpoint).toStrictEqual(endpoint);
  });

  it('should not set the query parameter if parameter value is generated', () => {
    paramLocation = 'query';
    pathLevelParamsSpecs.in = paramLocation;
    endpoint = '/mock-endpoint';
    getTestDataValueFromSchema.mockImplementation(() => undefined);
    resolvedEndpoint = getResolveTestEndpoint(endpoint, pathLevelParamsSpecs);

    expect(resolvedEndpoint).toStrictEqual(endpoint);
  });

  it('should return the original endpoint parameter is not in path or query', () => {
    paramLocation = 'unknown';
    pathLevelParamsSpecs.in = paramLocation;
    resolvedEndpoint = getResolveTestEndpoint(endpoint, pathLevelParamsSpecs);

    expect(resolvedEndpoint).toStrictEqual(endpoint);
  });
});
