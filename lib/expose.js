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
    const globals = [];

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
      globals.push({ [definition]: definitions[definition] });

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

      // add validation
      let validation = '';
      if (secure.length > 0) {
        validation = '';
        secure.forEach((property) => {
          let origin = property.type;
          if (origin === 'path') origin = 'params';
          validation = `${validation}
          global.FieldValidator.validate('${property.value}', req.${origin}['${property.definition}']['${property.property}'], req, res)
            .then(function (result) {
              if (!result) return;
            })
            .catch((err) => { return; });
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

    // load objects to the global scope
    global['objects'] = {};
    globals.forEach((object) => {
      const name = Object.keys(object);
      global.objects[name] = object[name];
    });

    // load classes to the global scope
    global['classes'] = {};
    fs.readdir(container, (err, dirs) => {
      if (err) {
        throw new Error(err.message || err);
      }
      dirs.forEach((dir) => {
        global.classes[dir] = require(`${container}/${dir}/${dir}.js`);
      });
    });
  } catch (err) {
    throw new Error(err.message || err);
  }
}

module.exports = expose;
