const _ = require('lodash');

/**
 * Format the responses for the APIs
 * @param data - initial data, that should have all of the necessary methods and schemas
 * @returns {object}
 */
async function format(data) {
  const { methods, definitions } = data;

  // check if there are none
  if (!(methods && methods.length > 0 && definitions && definitions.length > 0)) {
    throw new Error('Methods and definitions should not be empty!');
  }

  const mutable = _.cloneDeep(data);

  // process methods
  methods.forEach((method, i) => {
    const list = Object.keys(method.responses);
    const formatted = {};
    if (list.length > 0) {
      list.forEach((response) => {
        formatted[response] = method.responses[response];
        const refName = formatted[response].schema['$ref'].split('/').slice(-1)[0];
        definitions.forEach((definition) => {
          if (refName === definition.name) {
            formatted[response].properties = definition.tsType.properties;
          }
        });
      });
    }
    console.log('> ', formatted);
  });

  // console.log('> definitions', definitions);

  return mutable;
}

module.exports = {
  format,
};
