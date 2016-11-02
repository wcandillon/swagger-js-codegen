'use strict';

var _ = require('lodash');

/**
 * Recursively converts a swagger type description into a typescript type, i.e., a model for our mustache
 * template.
 *
 * Not all type are currently supported, but they should be straightforward to add.
 *
 * @param swaggerType a swagger type definition, i.e., the right hand side of a swagger type definition.
 * @returns a recursive structure representing the type, which can be used as a template model.
 */
function convertType(swaggerType) {

    var typespec = {};

    if (swaggerType && swaggerType.hasOwnProperty('schema')) {
        return convertType(swaggerType && swaggerType.schema);
    } else if (_.isString(swaggerType && swaggerType.$ref)) {
        typespec.tsType = 'ref';
        typespec.target = swaggerType && swaggerType.$ref.substring(swaggerType && swaggerType.$ref.lastIndexOf('/') + 1);
    } else if (swaggerType && swaggerType.type === 'string') {
        typespec.tsType = 'string';
    } else if (swaggerType && swaggerType.type === 'number' || swaggerType && swaggerType.type === 'integer') {
        typespec.tsType = 'number';
    } else if (swaggerType && swaggerType.type === 'boolean') {
        typespec.tsType = 'boolean';
    } else if (swaggerType && swaggerType.type === 'array') {
        typespec.tsType = 'array';
        typespec.elementType = convertType(swaggerType && swaggerType.items);
    } else if (swaggerType && swaggerType.type === 'object') {
        typespec.tsType = 'object';
        typespec.properties = [];

        _.forEach(swaggerType && swaggerType.properties, function (propertyType, propertyName) {
            var property = convertType(propertyType);
            property.name = propertyName;
            typespec.properties.push(property);
        });
    } else {
        // type unknown or unsupported... just map to 'any'...
        typespec.tsType = 'any';
    }

    // Since Mustache does not provide equality checks, we need to do the case distinction via explicit booleans
    typespec.isRef = typespec.tsType === 'ref';
    typespec.isObject = typespec.tsType === 'object';
    typespec.isArray = typespec.tsType === 'array';
    typespec.isAtomic = _.includes(['string', 'number', 'boolean', 'any'], typespec.tsType);

    return typespec;

}

module.exports.convertType = convertType;

