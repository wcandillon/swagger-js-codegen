const _ = require('lodash');

const specialKeys = ['Add', 'Create', 'Delete', 'Disable', 'Update'];

/**
 * Get the required properties for the query
 * @param params {array} - array of the method parameters
 * @returns {object} - { parameters: {string}, questions: {string} }
 */
function getProperties(params) {
  const parameters = [];
  const questions = [];
  params.forEach((param) => {
    if (param.in && param.in === 'path' || param.in === 'query') {
      parameters.push(param.name);
    }
    if (param.in && param.in === 'body') {
      const { '$ref': ref } = param.schema || {};
      if (ref) {
        parameters.push(ref.split('/').slice(-1)[0]);
      }
    }
    questions.push('?');
  });
  return {
    parameters: parameters.join(', '),
    questions: questions.join(', '),
  }
}

/**
 * Create SQL query for the method
 * @param data {object} - object with definitions & methods
 * @returns {*}
 */
function querier(data) {
  try {
    const mutable = _.cloneDeep(data);
    const { methods, definitions } = mutable;

    if (!(methods && methods.length > 0 && definitions && definitions.length > 0)) {
      return new Error('Methods and definitions should not be empty!');
    }

    methods.forEach((method, m) => {
      let special = false;
      specialKeys.forEach((key) => {
        if (method.methodName.includes(key)) {
          special = true;
        }
      });

      if (!special) {
        const { parameters, questions } = getProperties(method.parameters);
        mutable.methods[m].query = {
          content: `const results = await dal.query("SELECT FN_${method.methodName}(${questions})", [${parameters}], { redis: true });`,
        };
      } else {

      }
    });

    return mutable;
  } catch (err) {
    throw new Error(err.message || err);
  }
}

module.exports = querier;
