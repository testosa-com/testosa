const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const validateAjvSchema = (schema, data) => {
  const ajv = new Ajv({
    $data: true,
    allErrors: true,
    strict: false,
    strictSchema: false,
    useDefaults: true
  });

  addFormats(ajv);

  ajv.addFormat('date-time', (str) => {
    const regexExp =
      /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/;

    return regexExp.test(str);
  });

  ajv.addFormat('email', (str) => {
    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(str).toLowerCase());
  });

  ajv.addFormat('uuid', (str) => {
    const regexExp =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

    return regexExp.test(str);
  });

  const isValid = ajv.validate(schema, data);
  const { errors } = ajv;

  return {
    errors,
    isValid
  };
};

module.exports = validateAjvSchema;
