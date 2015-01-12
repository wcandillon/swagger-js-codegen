'use strict';

var Mustache = require('mustache');
var fs = require('fs');
var _ = require('lodash');
var beautify = require('js-beautify').js_beautify;

var templateArray = null;
var templatesVar = null;
var templatesEnum = null;
var templateModel = null;

var sourceCode = [];


var typeCamelCase = function(id) {
    var tokens = [];
    id.split('-').forEach(function(token, index){
        if(index === 0) {
            tokens.push(token[0].toUpperCase() + token.substring(1));
        } else {
            tokens.push(token[0].toUpperCase() + token.substring(1));
        }
    });
    return tokens.join('');
};

/**
 * [createCode description]
 * @param  {[type]} className [description]
 * @param  {[type]} src       [description]
 * @return {[type]}           [description]
 */
var createCode = function(className, src) {
	if (!_.contains(sourceCode, className)) {
		sourceCode.push({
			className: className,
			src: src
		});
	}
};

/**
 * load templates
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
var init = function(type) {
	templateModel = fs.readFileSync(__dirname + '/../templates/' + type + '-model-class.mustache', 'utf-8');
	templateArray = fs.readFileSync(__dirname + '/../templates/' + type + '-array-property.mustache', 'utf-8');
	templatesVar = fs.readFileSync(__dirname + '/../templates/' + type + '-property.mustache', 'utf-8');
	templatesEnum = fs.readFileSync(__dirname + '/../templates/' + type + '-enum-class.mustache', 'utf-8');
};


/**
 * load swagger specification
 * @return {Object} swagger
 */
var loadSample = function() {
	//return JSON.parse(fs.readFileSync(__dirname + '/../cr.swagger.json'));
	return JSON.parse(fs.readFileSync(__dirname + '/../task_swagger.json'));
	//		return JSON.parse(fs.readFileSync(__dirname+'/../tests/apis/account.json'));
};

var createProperty = function(key, property) {
	return _.merge({
		name: key
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
	enumList[enumList.length-1].last =true;
	var enumVar = {
		className: typeCamelCase(property + 'Enum'),
		type: typeCamelCase(property + 'Enum'),
		name: property,
		description: description === undefined ? '' : description,
		enums: []
	};
	enumList.forEach(function(item) {
		enumVar.enums.push({value : item});
	});
	// mark the last one so that we do not add an ,
	enumVar.enums[enumList.length-1].last = true; 
	createCode(enumVar.className, print(Mustache.render(templatesEnum, enumVar)));
	return enumVar;
};

/**
 * create property
 * @param  {[type]} properties [description]
 * @return {[type]}            [description]
 */
var createProperties = function(properties) {
	var vars = [];
	var swaggerProperties = [];
	var propertyList = _.keys(properties);
	//	console.log(propertyList);
	propertyList.forEach(function(property) {
		var varEntry = createProperty(property, properties[property]);
		
		if (varEntry.hasOwnProperty('allowableValues')) {
			var allowedEnumVar = generateEnumDataType(property, varEntry.description, varEntry.allowableValues.enum);
			vars.push(Mustache.render(templatesVar, allowedEnumVar));
		} else {
			if (varEntry.hasOwnProperty('enum')) {
				var enumVar = generateEnumDataType(property, varEntry.description, varEntry.enum);
				createCode(enumVar.className, print(Mustache.render(templatesEnum, enumVar)));
				vars.push(Mustache.render(templatesVar, enumVar));
			} else {
				if (varEntry.type === 'array' || varEntry.type==='List') {
					varEntry.typeof = varEntry.items.hasOwnProperty('$ref') ? '' + varEntry.items.$ref + '[]' : varEntry.items.type + '[]';
					vars.push(Mustache.render(templateArray, varEntry));
				} else {
					if (varEntry.format === 'date-time') {
						varEntry.type = 'Date';
					}
					vars.push(Mustache.render(templatesVar, varEntry));
				}
			}
		}
		
		//	console.log(s);
		swaggerProperties.push(varEntry);
	});
/*	console.log(swaggerProperties);*/

	return vars;
};

/**
 * create models
 * @param  {[type]} models [description]
 * @return {[type]}        [description]
 */
var createModels = function(models) {
	var modelList = _.keys(models);
//	console.log(modelList);
	modelList.forEach(function(model) {
//		console.log(models[model]);

		createCode(model, print(Mustache.render(templateModel,
			_.merge(models[model], {
				className: model,
				vars: createProperties(models[model].properties)
			})
		)));
	});
};

init('node');

var api = loadSample();

createModels(api.models);

_.forEach(sourceCode, function(item) {
	fs.writeFileSync('tmp/'+item.className + '.js', item.src);
/*	console.log(item.className + '.js');
	console.log(item.src);
*/});