'use strict';

var Mustache = require('mustache');
var _ = require('lodash');
var fs = require('fs');
var beautify = require('js-beautify').js_beautify;


/**
 * camel case format of model name
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */
var typeCamelCase = function(modelName) {
	var tokens = [];
	modelName.split('-').forEach(function(token, index) {
		if (index === 0) {
			tokens.push(token[0].toUpperCase() + token.substring(1));
		} else {
			tokens.push(token[0].toUpperCase() + token.substring(1));
		}
	});
	return tokens.join('');
};

var camelCase = function(id) {
	var tokens = [];
	id.split('-').forEach(function(token, index) {
		if (index === 0) {
			tokens.push(token[0].toLowerCase() + token.substring(1));
		} else {
			tokens.push(token[0].toUpperCase() + token.substring(1));
		}
	});

	return tokens.join('');
};

/**
 * create a var entity
 * @param  {[type]} varName  variable nanem
 * @param  {[type]} property list of properties from swagger spec that are merged
 * @return {variable}          [description]
 */
var createVar = function(varName, property) {
	return _.merge({
		name: camelCase(varName),
		initValue: 'null',
	}, property);
};

/**
 * print js file
 * @param  {[type]} source [description]
 * @return {[type]}        [description]
 */
var print = function(source) {
	return beautify(source, {
		indent_size: 2,
		max_preserve_newlines: 2
	});
};

/**
 * generate enum data type. This iterates through the enum definitions and creates an enum
 * @param  {[type]} property    [description]
 * @param  {[type]} description [description]
 * @param  {[type]} enumList    [description]
 * @return {[type]}             [description]
 */
var generateEnumDataType = function(property, description, enumList) {

	var enumVar = {
		className: typeCamelCase(property + 'Enum'),
		type: typeCamelCase(property + 'Enum'),
		name: property,
		enumValueType:'string',
		description: description === undefined ? '' : description,
		enums: []
	};
	enumList.forEach(function(item) {
		enumVar.enums.push({
			enumType : item.toUpperCase(),
			enumValue: item
		});

	});
	// mark the last one so that we do not add an
	enumVar.enums[enumList.length - 1].last = true;
	//createCode(enumVar.className, print(Mustache.render(templatesEnum, enumVar)));
	return enumVar;
};

var isArray = function(varEntry) {
	return varEntry.type === 'array' || varEntry.type === 'List';
};


/**
 * In OO universe there is inheritance ... this is representated as baseClass[<<DerivedClass>>]
 * This function removes all occurancences of < and >
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
var trimOOInheritance = function(name) {
	if (name.indexOf('«') > 0) {
		var n1 = name.replace('/«/g', '');
		return n1.replace('/»/g', '');
	}
	return name;
};


/**
 * create model properties a.k.a attributes
 * @param  {[type]} swaggerModelProperties model properties within the swagger model
 * @return {array}            model properties and any enum specification
 */
var createModelProperties = function(swaggerModelProperties) {
	/**
	 * array of enums that need to be created
	 * @type {Array}
	 */
	var enumsForGeneration = [];
	/**
	 * holds the rendered model properties
	 * @type {Array}
	 */
	var modelProperties = [];

	var propertyList = _.keys(swaggerModelProperties);

	propertyList.forEach(function(rawPropertyName) {
		var property = trimOOInheritance(rawPropertyName);
		var varEntry = createVar(property, swaggerModelProperties[property]);

		// enum processing enums are defined in line
		if (varEntry.hasOwnProperty('allowableValues')) {
			if (isArray(varEntry)) {
				varEntry.array = true;
			}
			var allowedEnumVar = generateEnumDataType(property,
				varEntry.description,
				varEntry.allowableValues.enum);

			varEntry.type = allowedEnumVar.type;
			enumsForGeneration.push(allowedEnumVar);

		} else {
			// another enum definition -- this is also defined in line
			if (varEntry.hasOwnProperty('enum')) {
				var enumVar = generateEnumDataType(property, varEntry.description, varEntry.enum);
				enumsForGeneration.push(enumVar);
				varEntry.type = enumVar.type;
			} else { // look for arrays 
				if (isArray(varEntry)) {
					varEntry.array = true;
					varEntry.initValue = '[]';

					
					if (varEntry.hasOwnProperty('$ref')) { // swagger 2.0 spec
						varEntry.type=	typeCamelCase(varEntry.$ref);
					}
					else {
						varEntry.type = varEntry.items.hasOwnProperty('$ref') ?
							typeCamelCase(varEntry.items.$ref) :
							typeCamelCase(varEntry.items.type);
					}
				} else { // finally define primitivies and other objects
					if (varEntry.format === 'date-time') {
						varEntry.type = 'Date';
					}
				}
			}
		}
		modelProperties.push(varEntry);
	});

	return {
		enums: enumsForGeneration,
		modelProperties: modelProperties
	};
};


/**
 * create models defined in swagger api
 * @param  {[type]} swagger       [description]
 * @param  {[type]} templateModel [description]
 * @param  {[type]} templateEnum  [description]
 * @return {[type]}               [description]
 */
var createModels = function(swagger, templateModel, templateEnum) {

	var codeSet = [];

	var swaggerModelList = swagger.swagger==='2.0' ? swagger.definitions:swagger.models;
	var modelList = _.keys(swaggerModelList);

	modelList.forEach(function(model) {

		var swagegerModelSpec = swaggerModelList[model];

		var nodeModelProperties = createModelProperties(swagegerModelSpec.properties);

		var nodeModel = {
			className: trimOOInheritance(model),
			description: swagegerModelSpec.description,
			vars: nodeModelProperties.modelProperties
		};

		if (!_.contains(codeSet, nodeModel.className)) {
			codeSet[nodeModel.className] = print(Mustache.render(templateModel, nodeModel));
		}

		nodeModelProperties.enums.forEach(function(enumItem) {
			if (!_.contains(codeSet, enumItem.className)) {
				codeSet[enumItem.className] = print(Mustache.render(templateEnum, enumItem));
			}

		});

	});
	return codeSet;
};


/**
 * create the model code
 * @param  {Object} opts swagger parameters
 * @param  {[type]} type type of generation we are doing
 * @return {array}      of generated code in a key-value pair,
 *                         where the key is the name of model
 *                         to be created and value the source code
 */
var getModelCode = function(opts, type) {
	var templateModel = fs.readFileSync(__dirname + '/../templates/' + type + '-model-class.mustache', 'utf-8');
	var templateEnum = fs.readFileSync(__dirname + '/../templates/' + type + '-enum-class.mustache', 'utf-8');
	var sourceCode = [];

	sourceCode = createModels(opts.swagger, templateModel, templateEnum);

	return sourceCode;
};

exports.CodeGenModel = {
	getNodeModelCode: function(opts) {

		return getModelCode(opts, 'node');
	},
};

//var api = loadSample();