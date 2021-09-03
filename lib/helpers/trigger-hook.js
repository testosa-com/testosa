const _ = require('lodash');

const triggerHook = async (hooksFilePath, hookName, transaction) => {
  let updatedTransaction = _.cloneDeep(transaction);

  if (hooksFilePath) {
    // eslint-disable-next-line
    const { [hookName]: hook } = require(hooksFilePath);

    if (_.isFunction(hook)) {
      updatedTransaction =
        hook instanceof (async () => {}).constructor
          ? await hook(transaction)
          : hook(transaction);
    }
  }

  return updatedTransaction;
};

module.exports = triggerHook;
