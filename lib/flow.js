'use strict';

var _ = require('lodash');

/**
 * Recursively converts a swagger type description into a flow type, i.e., a model for our mustache
 * template.
 *
 * Not all types are currently supported, but they should be straightforward to add.
 *
 * @param swaggerType a swagger type definition, i.e., the right hand side of a swagger type definition.
 * @returns a recursive structure representing the type, which can be used as a template model.
 */

var reservedWords = [
  "abstract","arguments","await","boolean","break","byte","case","catch","char",
  "class","const","continue","debugger","default","delete","do","double","else",
  "enum","eval","export","extends","false","final","finally","float","for",
  "function","goto","if","implements","import","in","instanceof","int","interface",
  "let","long","native","new","null","package","private","protected","public","return",
  "short","static","super","switch","synchronized","this","throw","throws","transient",
  "true","try","typeof","var","void","volatile","while","with","yield"
];

function sanitizeReservedWords(word) {
  if (_.includes(reservedWords, word)) {
    return word + '_type';
  }
  return word;
}

function getNameFromRef(ref) {
  return sanitizeReservedWords(ref.substring(ref.lastIndexOf('/') + 1));
}

function convertType(swaggerType, swagger) {
    var typespec = {
      description: swaggerType.description,
      simpleFlowType: undefined,
      isObject: false,
      isArray: false,
    };

    if (swaggerType.hasOwnProperty('schema')) {
        return convertType(swaggerType.schema);
    }

    if (_.isString(swaggerType.$ref)) {
        typespec.simpleFlowType = getNameFromRef(swaggerType.$ref);
    } else if (swaggerType.hasOwnProperty('enum')) {
        typespec.simpleFlowType = swaggerType.enum.map(JSON.stringify).join(' | ');
    } else if (swaggerType.type === 'string') {
        typespec.simpleFlowType = 'string';
    } else if (swaggerType.type === 'number' || swaggerType.type === 'integer') {
        typespec.simpleFlowType = 'number';
    } else if (swaggerType.type === 'boolean') {
        typespec.simpleFlowType = 'boolean';
    } else if (swaggerType.type === 'array') {
        typespec.isArray = true;
        typespec.elementType = convertType(swaggerType.items);
    } else if (swaggerType.hasOwnProperty('additionalProperties')) {
        typespec.isObject = true;
        typespec.properties = [convertType(swaggerType.additionalProperties)];
        typespec.properties[0].name = '[string]';
        typespec.properties[0].optional = false;
    } else { // remaining types are created as objects
        if (swaggerType.minItems >= 0 && swaggerType.hasOwnProperty('title') && !swaggerType.$ref) {
            typespec.simpleFlowType = 'any';
        } else {
            typespec.isObject = true;
            typespec.properties = [];
            if (swaggerType.allOf) {
                _.forEach(swaggerType.allOf, function (ref) {
                    if(ref.$ref) {
                        var name = getNameFromRef(ref.$ref);
                        _.forEach(swagger.definitions, function (definition, definitionName) {
                            if (definitionName === name) {
                                var property = convertType(definition, swagger);
                                Array.prototype.push.apply(typespec.properties, property.properties);
                            }
                        });
                    } else {
                        var property = convertType(ref);
                        Array.prototype.push.apply(typespec.properties, property.properties);
                    }
                });
            }

            _.forEach(swaggerType.properties, function (propertyType, propertyName) {
                var property = convertType(propertyType);
                property.name = propertyName;

                property.optional = true;
                if (swaggerType.required && swaggerType.required.indexOf(propertyName) !== -1) {
                  property.optional = false;
                }

                typespec.properties.push(property);
            });
        }
    }

    return typespec;
}

module.exports = {
  convertType: convertType,
  sanitizeReservedWords: sanitizeReservedWords,
};
