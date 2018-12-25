"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
/**
 * Recursively converts a swagger type description into a typescript type, i.e., a model for our mustache
 * template.
 *
 * Not all type are currently supported, but they should be straightforward to add.
 *
 * @param swaggerType a swagger type definition, i.e., the right hand side of a swagger type definition.
 * @param swagger the full swagger spec object
 * @returns a recursive structure representing the type, which can be used as a template model.
 */
function convertType(swaggerType, swagger) {
    var typespec = {
        name: undefined,
        description: swaggerType.description,
        isEnum: false,
        isArray: false,
        isDictionary: false,
        isObject: false,
        isRef: false,
        isNullable: !swaggerType.required,
        isRequired: Boolean(swaggerType.required),
        requiredPropertyNames: (swaggerType.type === 'object' && swaggerType.required) || [],
        tsType: undefined,
        isAtomic: false,
        enum: undefined,
        target: undefined,
        elementType: undefined,
        properties: undefined
    };
    if (swaggerType.hasOwnProperty('schema')) {
        return convertType(swaggerType.schema, swagger);
    }
    else if (_.isString(swaggerType.$ref)) {
        typespec.tsType = 'ref';
        typespec.target = swaggerType.$ref.substring(swaggerType.$ref.lastIndexOf('/') + 1);
    }
    else if (swaggerType.hasOwnProperty('enum') && swaggerType.enum) {
        typespec.tsType = swaggerType.enum.map(function (str) { return JSON.stringify(str); }).join(' | ');
        typespec.isAtomic = true;
        typespec.isEnum = true;
        typespec.enum = swaggerType.enum;
    }
    else if (swaggerType.type === 'string') {
        typespec.tsType = 'string';
    }
    else if (swaggerType.type === 'number' || swaggerType.type === 'integer') {
        typespec.tsType = 'number';
    }
    else if (swaggerType.type === 'boolean') {
        typespec.tsType = 'boolean';
    }
    else if (swaggerType.type === 'array') {
        typespec.elementType = convertType(swaggerType.items, swagger);
        typespec.tsType = `Array<${typespec.elementType.target || typespec.elementType.tsType || 'any'}>`;
        typespec.isArray = true;
    }
    else if (swaggerType.type === 'object' && swaggerType.hasOwnProperty('additionalProperties')) {
        // case where a it's a Dictionary<string, someType>
        typespec.elementType = convertType(swaggerType.additionalProperties, swagger);
        typespec.tsType = `{ [key: string]: ${typespec.elementType.target || typespec.elementType.tsType || 'any'} }`;
        typespec.isDictionary = true;
    }
    else /*if (swaggerType.type === 'object')*/ { //remaining types are created as objects
        if (swaggerType.minItems >= 0 && swaggerType.hasOwnProperty('title') && !swaggerType.$ref) {
            typespec.tsType = 'any';
        }
        else {
            typespec.tsType = 'object';
            typespec.properties = [];
            if (swaggerType.allOf) {
                _.forEach(swaggerType.allOf, function (ref) {
                    if (ref.$ref) {
                        let refSegments = ref.$ref.split('/');
                        let name = refSegments[refSegments.length - 1];
                        _.forEach(swagger.definitions, function (definition, definitionName) {
                            if (definitionName === name) {
                                var property = convertType(definition, swagger);
                                typespec.properties = _.concat(_.filter(typespec.properties), _.filter(property.properties));
                            }
                        });
                    }
                    else {
                        var property = convertType(ref, swagger);
                        typespec.properties = _.concat(_.filter(typespec.properties), _.filter(property.properties));
                    }
                });
            }
            _.forEach(swaggerType.properties, function (propertyType, propertyName) {
                var property = convertType(propertyType, swagger);
                property.name = propertyName;
                property.isRequired = _.includes(typespec.requiredPropertyNames, propertyName);
                typespec.properties = _.concat(_.filter(typespec.properties), property);
            });
        }
    }
    // Since Mustache does not provide equality checks, we need to do the case distinction via explicit booleans
    typespec.isRef = typespec.tsType === 'ref';
    typespec.isObject = typespec.tsType === 'object';
    typespec.isAtomic = typespec.isAtomic || _.includes(['string', 'number', 'boolean', 'any'], typespec.tsType);
    return typespec;
}
exports.convertType = convertType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNEJBQTRCO0FBd0I1Qjs7Ozs7Ozs7O0dBU0c7QUFDSCxTQUFnQixXQUFXLENBQUMsV0FBd0IsRUFBRSxPQUFnQjtJQUNsRSxJQUFJLFFBQVEsR0FBYTtRQUNyQixJQUFJLEVBQUUsU0FBUztRQUNmLFdBQVcsRUFBRSxXQUFXLENBQUMsV0FBVztRQUNwQyxNQUFNLEVBQUUsS0FBSztRQUNiLE9BQU8sRUFBRSxLQUFLO1FBQ2QsWUFBWSxFQUFFLEtBQUs7UUFDbkIsUUFBUSxFQUFFLEtBQUs7UUFDZixLQUFLLEVBQUUsS0FBSztRQUNaLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRO1FBQ2pDLFVBQVUsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztRQUN6QyxxQkFBcUIsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO1FBQ3BGLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFFBQVEsRUFBRSxLQUFLO1FBQ2YsSUFBSSxFQUFFLFNBQVM7UUFDZixNQUFNLEVBQUUsU0FBUztRQUNqQixXQUFXLEVBQUUsU0FBUztRQUN0QixVQUFVLEVBQUUsU0FBUztLQUN4QixDQUFDO0lBQ0YsSUFBSSxXQUFXLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3RDLE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDbkQ7U0FDSSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ25DLFFBQVEsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxT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