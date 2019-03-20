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
  // get list of the definitions
  const list = Object.keys(definitions);

  // make sure that /definitions directory exists
  const container = `${path}/definitions`;
  if (!fs.existsSync(container)) {
    fs.mkdirSync(container);
  }

  // process definitions
  list.forEach(async (definition) => {
    // expose definitions objects
    global[definition] = definitions[definition];

    // make sure that destination definition directory exists
    const destination = `${container}/${definition}`;
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination);
    }

    // bind the parameters
    let parameters = '';
    methods.forEach((method) => {
      method.parameters.forEach((parameter) => {
        if (parameter.name === definition) {
          let origin = parameter['in'];
          if (origin === 'path') origin = 'params';
          parameters = `${parameters}
          this.${parameter.name} = req.${origin}['${parameter.name}'];`
        }
      })
    });

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

    // create validation method
    let validation = '';
    if (secure.length > 0) {
      validation = `async validation(req, res, params) {`;
      secure.forEach((property) => {
        let origin = property.type;
        if (origin === 'path') origin = 'params';
        validation = `${validation}
          await FieldValidator.validate('${property.value}', req.${origin}['${property.definition}']['${property.property}'], req, res);
        `;
      });
      validation = `${validation}
      }`;
    }

    // compile the file
    const content = `/* auto-generated: ${definition}.js */
    
    module.exports = class ${definition} {
      constructor(req, res, params) {
        this.req = req;
        this.res = res;
        this.params = params;
        ${parameters}  
      }
      
      ${validation} 
      
      ${definition} = ${inspect(definitions[definition], { showHidden: false, depth: null })};
    };`;

    // create file in the destination folder
    fs.writeFileSync(`${destination}/${definition}.js`,
      beauty(content, { indent_size: 2 }),
      (err) => {
        if (err) {
          throw new Error(err.message);
        }
      });
  });
}

module.exports = expose;
