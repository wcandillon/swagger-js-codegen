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
		if (token !== '') {
			if (index === 0) {
				tokens.push(token[0].toUpperCase() + token.substring(1));
			} else {
				tokens.push(token[0].toUpperCase() + token.substring(1));
			}
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
 * @param  {string} varName  variable nanem
 * @param  {object} property list of properties from swagger spec that are merged
 * @return {object}          representing a variable within a generated object
 */
var createVar = function(varName, property) {
	var obj = _.merge({
		name: camelCase(varName),
		initValue: 'null',
		isEnumInLineEnumRef: false
	}, property);

	if (obj.hasOwnProperty('$ref')) {
		obj.type=typeCamelCase(obj.$ref);
	}

	return obj;
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
 * @param  {string} property    name of enum we will create
 * @param  {string} description enum description
 * @param  {string[]} enumList    list of enum values
 * @return {[type]}             [description]
 */
var generateEnumDataType = function(property, description, enumList) {

	var enumVar = {
		fileName: property + '-enum',
		className: typeCamelCase(property + 'Enum'),
		type: typeCamelCase(property + 'Enum'),
		name: property,
		enumValueType: 'string',
		description: description === undefined ? '' : description,
		enums: []
	};
	enumList.forEach(function(item) {
		enumVar.enums.push({
			enumType: item.toUpperCase(),
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
 * @param  {object[]} swaggerModelProperties model properties within the swagger model
 * @param {string} className name of class we are creating ..
 * @return {object}            model properties and any enum specification
 */
var createModelProperties = function(swaggerModelProperties, className) {
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
			var allowedEnumVar = generateEnumDataType(className + '-' + typeCamelCase(property),
				varEntry.description,
				varEntry.allowableValues.enum);

			varEntry.type = className + allowedEnumVar.type;
			enumsForGeneration.push(allowedEnumVar);

		} else {
			// another enum definition -- this is defined in line with the api parameter definition ... 
			if (varEntry.hasOwnProperty('enum')) {
				var enumVar = generateEnumDataType(className + '-' + property, varEntry.description, varEntry.enum);
				enumsForGeneration.push(enumVar);
				varEntry.type = enumVar.type;
				varEntry.isEnumInLineEnumRef = true;
			} else { // look for arrays 
				if (isArray(varEntry)) {
					varEntry.array = true;
					varEntry.initValue = '[]';


					if (varEntry.hasOwnProperty('$ref')) { // swagger 2.0 spec
						varEntry.type = typeCamelCase(varEntry.$ref);
					} else {
						varEntry.type = varEntry.hasOwnProperty('$ref') ?
							typeCamelCase(varEntry.$ref) :
							typeCamelCase(varEntry.type);
					}
				} else { // finally define primitivies and other objects
					if (varEntry.format === 'date-time') {
						varEntry.type = 'Date';
					}
					else {
						if (varEntry.hasOwnProperty('$ref')) {
							if (varEntry.$ref==='date-time') {
								varEntry.type = 'Date';			
							}
						}
					}
				}
			}
		}
		modelProperties.push(varEntry);
	});

	// return object contains two lists ... one for enums and another for properties...
	return {
		enums: enumsForGeneration,
		modelProperties: modelProperties
	};
};


/**
 * create models defined in swagger api
 * @param  {string} swagger       model
 * @param  {string} templateModel mustache template for normal vars
 * @param  {string} templateEnum  mustache template for enums
 * @param  {string} camelCaseFileName set to true for file name to be in 'CamelCaseFileName.js' format
 * @return {{fileName:string,code:string}[]}  where filename is the name of the file the code shoudl be written
 */
var createModels = function(swagger, templateModel, templateEnum, camelCaseFileName) {
	var codeSet = {};

	var swaggerModelList = swagger.swagger === '2.0' ? swagger.definitions : swagger.models;
	var modelList = _.keys(swaggerModelList);

	modelList.forEach(function(model) {

		// get definition from list 
		var swagegerModelSpec = swaggerModelList[model];

		var nodeModelProperties = createModelProperties(swagegerModelSpec.properties, model);

		// adjust for namespace ... 

		var nodeModel = {
			fileName: model,
			className: trimOOInheritance(model),
			description: swagegerModelSpec.description,
			vars: nodeModelProperties.modelProperties
		};

		// add classes provided we have not added it
		if (!_.contains(codeSet, nodeModel.className)) {
			codeSet[nodeModel.className] = {
				fileName: camelCaseFileName ? typeCamelCase(nodeModel.fileName) : nodeModel.fileName.toLowerCase(),
				code: print(Mustache.render(templateModel, nodeModel))
			};
		}

		// add enums to the list .. this is because models have enums inlined !
		nodeModelProperties.enums.forEach(function(enumItem) {

			if (!_.contains(codeSet, enumItem.className)) {
				codeSet[enumItem.className] = {
					fileName: camelCaseFileName ? typeCamelCase(enumItem.fileName) : enumItem.fileName.toLowerCase(),
					code: print(Mustache.render(templateEnum, enumItem))
				};
			}

		});

	});
	return codeSet;
};


/**
 * create a name space 
 * @param  {[type]} nameSpace [description]
 * @param  {[type]} codeSet   [description]
 * @param  {[type]} template  [description]
 * @return {[type]}           [description]
 */
var createNameSpace = function(nameSpace, codeSet, template) {
	var nameSpaceCodeSet = {
		nameSpace: nameSpace,
		fileName: 'index.js',
		vars: [],
		nameSpaceCode: null,
		modelCodeSet : codeSet
	};
	var varCounter = 0;
	for (var varItem in codeSet) {
		varCounter++;
		nameSpaceCodeSet.vars.push({
			name: varItem,
			fileName: codeSet[varItem].fileName,
			notLast: true
		});	
	}

	nameSpaceCodeSet.vars[varCounter-1].notLast=false;

	nameSpaceCodeSet.nameSpaceCode = print(Mustache.render(template,nameSpaceCodeSet));

	return nameSpaceCodeSet;
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

	var templateModel;
	var templateEnum;
	var templateNameSpace;
	var sourceCode = [];

	if (type === 'custom') {
		if (!_.isObject(opts.template) || !_.isString(opts.template.class) || !_.isString(opts.template.method) || !_.isString(opts.template.request)) {
			throw new Error('Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }');
		}
		templateModel = opts.template.modelClass;
		templateEnum = opts.template.modelEnum;
		templateNameSpace = opts.template.nameSpace;
	} else {
		templateModel = fs.readFileSync(__dirname + '/../templates/' + type + '-model-class.mustache', 'utf-8');
		templateEnum = fs.readFileSync(__dirname + '/../templates/' + type + '-enum-class.mustache', 'utf-8');
		templateNameSpace = fs.readFileSync(__dirname + '/../templates/' + type + '-model-namespace.mustache', 'utf-8');
	}

	sourceCode = createModels(opts.swagger, templateModel, templateEnum,
		opts.camelCaseFileName === undefined ? false : opts.camelCaseFileName);

	return createNameSpace(opts.nameSpace,sourceCode, templateNameSpace);
};

exports.CodeGenModel = {
	getCodeGen: function(opts, type) {
		return getModelCode(opts, type);
	}
};