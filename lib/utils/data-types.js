const isArray = (value) => Array.isArray(value);

const isInteger = (value) => Number.isInteger(value);

const isPlainObject = (value) =>
  value instanceof Object &&
  !Array.isArray(value) &&
  {}.toString.call(value) === '[object Function]';

const isString = (value) => typeof value === 'string';

const getObjectByPath = (obj, path, defValue) => {
  // If path is not defined or it has false value
  if (!path) {
    return undefined;
  }

  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
  // Find value
  const result = pathArray.reduce(
    (prevObj, key) => prevObj && prevObj[key],
    obj
  );

  return result === undefined ? defValue : result;
};

module.exports = {
  getObjectByPath,
  isArray,
  isInteger,
  isPlainObject,
  isString
};
