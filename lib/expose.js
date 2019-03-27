const beauty = require('js-beautify').js;
const fs = require('fs');
const { inspect } = require('util');

/**
 * Expose definitions objects, create files with objects
 * @param {object} definitions - object that contain definitions objects
 * @param {array} methods - array of the available methods
 * @param {string} path - where to generate the files, resulting path will be path/definitions
 */
function expose(definitions, methods, path) {
  try {
    // get list of the definitions
    const list = Object.keys(definitions);

    // do not proceed if there are no definitions
    if (list.length === 0) {
      return console.log('> swagger-js-codegen @ No objects to expose!');
    }

    // make sure that ~/definitions directory exists
    const container = `${path}/definitions`;
    if (!fs.existsSync(container)) {
      fs.mkdirSync(container);
    }

    // process definitions
    list.forEach(async (definition) => {
      // bind the parameters
      let parameters = '';
      const props = Object.keys(definitions[definition].properties);
      if (props.length && props.length > 0) {
        props.forEach((prop) => {
          const { type } = definitions[definition].properties[prop];
          if (type) {
            if (type === 'array') {
              const { items } = definitions[definition].properties[prop];
              if (items) {
                if (items['$ref']) {
                  const refName = items['$ref'].split('/').slice(-1)[0];
                  parameters = `${parameters}
                    this['${prop}'] = [];
                    if (req.body['${prop}'].length && req.body['${prop}'].length > 0) {
                      req.body['${prop}'].forEach((object) => {
                      const ${refName} = new global.classes['${refName}'](req, res, object);
                      this.${prop}.push(${refName});
                    });
                  }`;
                } else {
                  parameters = `${parameters}
                    this['${prop}'] = req.body['${prop}'];`;
                }
              } else {
                parameters = `${parameters}
                  this['${prop}'] = req.body['${prop}'];`;
              }
            } else {
              parameters = `${parameters}
                this['${prop}'] = req.body['${prop}'];`;
            }
          } else {
            if (definitions[definition].properties[prop]['$ref']) {
              const refName = definitions[definition].properties[prop]['$ref'].split('/').slice(-1)[0];
              parameters = `${parameters}
                this['${prop}'] = new global.classes['${refName}'](req, res, req.body['${prop}']);`;
            }
          }
        });
      }

      // check x-AuthFieldType field
      const secure = [];
      if (!(definitions[definition].properties instanceof Array)) {
        const properties = Object.keys(definitions[definition].properties);
        properties.forEach((property) => {
          if (definitions[definition].properties[property]['x-AuthFieldType']) {
            methods.forEach((method) => {
              method.parameters.forEach((parameter) => {
                if (parameter.name === definition) {
                  secure.push({
                    type: parameter['in'],
                    definition,
                    property,
                    value: definitions[definition].properties[property]['x-AuthFieldType'],
                  });
                }
              });
            });
          }
        });
      } else {
        definitions[definition].properties.forEach((property, i) => {
          if (property['x-AuthFieldType']) {
            methods.forEach((method) => {
              method.parameters.forEach((parameter) => {
                if (parameter.name === definition) {
                  secure.push({
                    type: parameter['in'],
                    definition,
                    property,
                    value: property['x-AuthFieldType'],
                  });
                }
              })
            });
          }
        });
      }

      // add validation
      let validation = '';
      if (secure.length > 0) {
        validation = '';
        secure.forEach((property) => {
          let origin = property.type;
          if (origin === 'path') origin = 'params';
          validation = `${validation}
          global.FieldValidator.validate('${property.value}', req.${origin}['${property.property}'], req, res)
            .then(function (result) {
              if (!result) return;
            })
            .catch((err) => { 
              return; 
            });
        `;
        });
      }

      // compile the file
      const content = `/* auto-generated: ${definition}.js */
    
        module.exports = class {
          constructor(req = {}, res = {}, params = {}) {
            this.req = req;
            this.res = res;
            this.params = params;
            ${parameters}
            ${validation}  
            this.schema = ${inspect(definitions[definition], { showHidden: false, depth: null })}; 
          }
        };`;

      // make sure that destination definition directory exists
      const destination = `${container}/${definition}`;
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination);
      }

      // create file in the destination folder
      fs.writeFileSync(`${destination}/${definition}.js`,
        beauty(content, { indent_size: 2 }),
        (err) => {
          if (err) {
            throw new Error(err.message || err);
          }
        });
    });
  } catch (err) {
    throw new Error(err.message || err);
  }
}

module.exports = expose;
