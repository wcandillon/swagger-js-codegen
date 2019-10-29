const { inspect } = require('util');
const _ = require('lodash');

/**
 * Parse nested schemas to build the proper response structure
 * @param {object} entry - entry definition object
 * @param {array} definitions - all of the definitions
 * @param {number} status - response status
 * @returns {object}
 */
function responseBuilder(entry, definitions, status) {
  try {
    const response = {};

    // check tsType
    const { tsType } = entry || {};
    if (!tsType) {
      return response;
    }

    // process properties
    const { properties } = tsType || {};
    if (properties && properties.length > 0) {
      properties.forEach((property) => {
        if (property.tsType === 'string') {
          response[property.name] = property.example || 'string';

          // this is done for a particular case
          // TODO: proper error messages mapping - sligtly change the formatter
          if (status >= 400) {
            if (property.name === 'description') {
              response[property.name] = 'ERROR_DESCRIPTION';
            }
            if (property.name === 'reasonPhrase') {
              response[property.name] = 'BAD_REQUEST';
            }
          }

        }

        if (property.tsType === 'number') {
          response[property.name] = property.example || 0;
        }

        if (property.tsType === 'array') {
          // use provided example if any
          if (property.example) {
            response[property.name] = property.example;
          } else {
            // check elementType
            if (property.elementType) {
              const { tsType: type, target } = ((property || {}).elementType || {});
              if (type && type === 'ref' && target) {
                definitions.forEach((definition) => {
                  if (definition.name === target) {
                    // recursive call to unwrap all of the refs
                    response[property.name] = [responseBuilder(definition, definitions, status)];
                  }
                });
              } else {
                response[property.name] = [];
              }
            } else {
              response[property.name] = [];
            }
          }
        }

        // just in case...
        if (property.tsType === 'object') {
          response[property.name] = property.example || {};
        }

        if (property.tsType === 'ref') {
          definitions.forEach((definition) => {
            if (definition.name === property.target) {
              // recursive call to unwrap all of the refs
              response[property.name] = responseBuilder(definition, definitions, status);
            }
          });
        }
      });
    }

    return response;
  } catch (err) {
    throw new Error(err.message || err);
  }
}

/**
 * Format the responses for the APIs
 * @param data - initial data, that should have all of the necessary methods and schemas
 * @returns {object}
 */
function format(data) {
  try {
    const { methods, definitions } = data;
    const objects = [];

    // check if there are none
    if (!(methods && methods.length > 0 && definitions && definitions.length > 0)) {
      return new Error('Methods and definitions should not be empty!');
    }

    const mutable = _.cloneDeep(data);

    // locate all of the protected properties
    const secure = [];
    definitions.forEach((definition) => {
      definition.tsType.properties.forEach((property) => {
        if (property['x-AuthFieldType']) {
          secure.push({
            parameterName: definition.name,
            propertyName: property.name,
            value: property['x-AuthFieldType'],
          });
        }
      });
    });

    // get definitions based on $ref
    methods.forEach((method, i) => {
      const list = Object.keys(method.responses);
      const formatted = {};
      if (list.length > 0) {
        list.forEach((response) => {
          formatted[response] = method.responses[response];
          const refName = formatted[response].schema.items ? 
                          formatted[response].schema.items['$ref'].split('/').slice(-1)[0] : 
                          formatted[response].schema['$ref'].split('/').slice(-1)[0];
          definitions.forEach((definition) => {
            // copy properties
            if (refName === definition.name) {
              formatted[response].properties = definition.tsType.properties;
              formatted[response].status = Number(response) || null;
            }
          });
        });
      }

      // pass protected properties to the parameters
      secure.forEach((property, j) => {
        method.parameters.forEach((parameter, k) => {
          if (parameter.name === property.parameterName) {
            mutable.methods[i].parameters[k]['x-AuthFieldType'] = secure[j];
          }
        });
      });

      // add object references to the method (load objects as local variables inside the controller)
      method.parameters.forEach((parameter) => {
        if (parameter.schema) {
          const reference = parameter.schema['$ref'].split('/').slice(-1)[0];
          objects.push({
            destination: method.destination,
            origin: parameter['in'] === 'path' ? 'params' : parameter['in'],
            parameterName: parameter.name,
            reference,
          })
        }
      });

      // generate the code
      list.forEach((response) => {
        const ref = formatted[response].schema['$ref'].split('/').slice(-1)[0];
        let responseObject = {};
        definitions.forEach((def) => {
          if (def.name === ref) {
            responseObject = responseBuilder(def, definitions, formatted[response].status);
          }
        });

        const isErr = formatted[response].status >= 400 ? 'err' : 'null';
        formatted[response].code = 'return global.response(req, res, '
          + `${formatted[response].status}, ${inspect(responseObject, { showHidden: false, depth: null })}, ${isErr});`;
      });

      // add the code to the resulting object
      mutable.methods[i].responses = formatted;
    });

    // add objects
    mutable.objects = objects;

    // fix x-AuthFieldType TODO: need to rewrite it properly
    mutable.methods.forEach((method, m) => {
      method.parameters.forEach((parameter, p) => {
        if (parameter['x-AuthFieldType']) {
          const { propertyName: name, value } = parameter['x-AuthFieldType'];
          if (!(name && value)) {
            mutable.methods[m].parameters[p]['x-AuthFieldType'] = {
              propertyName: parameter.name,
              value: parameter['x-AuthFieldType'],
            };
          }
        }
      });
    });

    return mutable;
  } catch (err) {
    throw new Error(err.message || err);
  }
}

module.exports = {
  format,
};
