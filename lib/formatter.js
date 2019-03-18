const _ = require('lodash');

/**
 * Format the responses for the APIs
 * @param data - initial data, that should have all of the necessary methods and schemas
 * @returns {object}
 */
function format(data) {
  const { methods, definitions } = data;

  // check if there are none
  if (!(methods && methods.length > 0 && definitions && definitions.length > 0)) {
    throw new Error('Methods and definitions should not be empty!');
  }

  const mutable = _.cloneDeep(data);

  // get definitions based on $ref
  methods.forEach((method, i) => {
    const list = Object.keys(method.responses);
    const formatted = {};
    if (list.length > 0) {
      list.forEach((response) => {
        formatted[response] = method.responses[response];
        const refName = formatted[response].schema['$ref'].split('/').slice(-1)[0];
        definitions.forEach((definition) => {
          // TODO: pass the 'x-AuthFieldType' to the method
          definition.tsType.properties.forEach((property) => {

          });

          // copy properties
          if (refName === definition.name) {
            formatted[response].properties = definition.tsType.properties;
            formatted[response].status = Number(response) || null;
          }
        });
      });
    }

    // generate the code
    list.forEach((response) => {
      let code = `return res.code(${formatted[response].status}).send({`;
      formatted[response].properties.forEach((property, i) => {
        // remove the whitespaces from the parameter names
        const name = property.name.replace(/\s/g, '');
        formatted[response].properties[i].name = name;
        // escape the quotes
        const value = property.tsType === 'string' ? '\'string\'' : 0;
        code = `${code}
          ${name}: ${value},`;
      });
      formatted[response].code = `${code}
        });`;
    });

    // add the code to the resulting object
    mutable.methods[i].responses = formatted;
  });

  return mutable;
}

module.exports = {
  format,
};
