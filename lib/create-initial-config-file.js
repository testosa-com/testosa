const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ajvErrors = require('ajv-errors');
const ajvFormats = require('ajv-formats');
const inquirer = require('inquirer');
const _ = require('lodash');
const { logEmptyLines, logErrorAndTerminate } = require('./helpers/log');
const testosaConfigSchema = require('./schemas/testosa-config');
const log = require('./utils/log');

const validateSingleField = (fieldSchema, data) => {
  const ajv = new Ajv({
    $data: true,
    allErrors: true,
    strict: false,
    strictSchema: false,
    useDefaults: true
  });
  ajvErrors(ajv);
  ajvFormats(ajv);

  const isValidField = ajv.validate(fieldSchema, data);

  if (!isValidField) {
    logEmptyLines();
    log.error(`  - ${ajv.errors[0].message}`);
  }

  return isValidField;
};

const getQuestions = (options) => {
  const extendedQuestions = [];
  const {
    errorMessage,
    properties: configSchemaProperties,
    required: requiredKeys
  } = testosaConfigSchema;
  const schemaPropertyKeys = Object.keys(configSchemaProperties);

  schemaPropertyKeys.forEach((key) => {
    const isRequiredField = requiredKeys.includes(key);
    const { [key]: existingOptionValue } = options;

    if (existingOptionValue || isRequiredField) {
      const { type } = configSchemaProperties[key];
      const question = {
        name: key,
        type,
        validate: (input) => {
          const fieldSchema = {
            errorMessage,
            properties: configSchemaProperties
          };
          const data = {
            [key]: input
          };

          return validateSingleField(fieldSchema, data);
        }
      };

      if (existingOptionValue) {
        question.default = existingOptionValue;
      }

      extendedQuestions.push(question);
    }
  });

  return _.sortBy(extendedQuestions, (o) => o.name);
};

const getExistingConfigFileOptions = (filePath) => {
  const resolvedFilePath = path.resolve(process.cwd(), filePath);
  let configFileOptions = {};

  try {
    if (fs.existsSync(resolvedFilePath)) {
      log.warn(
        `Testosa config file found at ${filePath}. Reinitializing will overwrite existing values.`
      );
      logEmptyLines();
      const configFileRawData = fs.readFileSync(resolvedFilePath, 'utf8');
      configFileOptions = JSON.parse(configFileRawData);
    }
  } catch (error) {
    logErrorAndTerminate(
      `Error while reading Testosa config file at ${resolvedFilePath}\n - ${error.message}`
    );
  }

  return configFileOptions;
};

const createInitialConfigFile = async () => {
  try {
    logEmptyLines();
    log.info('Initializing Testosa');

    const filePath = './testosa.config.json';
    const resolvedFilePath = path.resolve(process.cwd(), filePath);
    const existingConfigFileOptions = getExistingConfigFileOptions(
      filePath,
      resolvedFilePath
    );
    const questions = getQuestions(existingConfigFileOptions);

    const options = await inquirer.prompt(questions);
    const optionsRaw = JSON.stringify(options, null, 2);
    fs.writeFileSync(resolvedFilePath, optionsRaw, 'utf8');

    logEmptyLines();
    log.success(`Testosa config file successfully initialized at: ${filePath}`);
    logEmptyLines();
  } catch (error) {
    log.error(`Error initializing Testosa config — ${error.message}`);
  }
};

module.exports = createInitialConfigFile;
