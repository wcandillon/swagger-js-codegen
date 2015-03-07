'use strict';

var fs = require('fs');
var Mustache = require('mustache');
var beautify = require('js-beautify').js_beautify;
var lint = require('jshint').JSHINT;
var _ = require('lodash');

var CodeGenModel = require('./codegen-model.js').CodeGenModel;

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
 * we need to define content-type header entry otherwise
 * @param defaultContentType
 * @param opContentType
 * @returns {string}
 */
var mergeContentTypes = function(defaultContentType, opContentType) {
	var contentTypes = '';
	// serialize default
	defaultContentType.forEach(function(cType) {
		if (contentTypes.indexOf(cType) === -1) {
			contentTypes = contentTypes.length > 0 ? ';' + cType : cType;
		}
	});

	// merge in operation
	opContentType.forEach(function(cType) {
		if (contentTypes.indexOf(cType) === -1) {
			contentTypes = contentTypes.length > 0 ? ';' + cType : cType;
		}
	});

	return contentTypes;
};

var getPathToMethodName = function(m, path) {
	var segments = path.split('/').slice(1);
	segments = _.transform(segments, function(result, segment) {
		if (segment[0] === '{' && segment[segment.length - 1] === '}') {
			segment = 'by' + segment[1].toUpperCase() + segment.substring(2, segment.length - 1);
		}
		result.push(segment);
	});
	var result = camelCase(segments.join('-'));
	return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

/**
 * extract response model from specification - is supports on swagger v1.2
 * @param  {object} op [description]
 * @return {string}    name of type ..
 */
var getResponseModelV2 = function(op) {
	var responseModel = 'object'; // set default ..

	if (op.type !== undefined) {
		if (op.type.toLowerCase() === 'array' || op.type.toLowerCase() === 'list') {
			if (op.items !== null && op.items.hasOwnProperty('$ref')) {
				responseModel = op.items.$ref + '[]';
			}
		} else {
			responseModel = op.type;
		}
	}

	return responseModel;
};

var getViewForSwagger2 = function(opts, type) {
	var swagger = opts.swagger;
	var authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLIK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'];
	var defaultContentType = [];

	var data = {
		isNode: type === 'node',
		description: swagger.info.description,
		isSecure: swagger.securityDefinitions !== undefined,
		moduleName: opts.moduleName,
		className: opts.className,
		domain: (swagger.schemes && swagger.schemes.length > 0 && swagger.host && swagger.basePath) ? swagger.schemes[0] + '://' + swagger.host + swagger.basePath : '',
		methods: []
	};
	defaultContentType = swagger.consumes || [];

	_.forEach(swagger.paths, function(api, path) {
		var globalParams = [];
		_.forEach(api, function(op, m) {
			if (m.toLowerCase() === 'parameters') {
				globalParams = op;
			}
		});
		_.forEach(api, function(op, m) {
			if (authorizedMethods.indexOf(m.toUpperCase()) === -1) {
				return;
			}
			var method = {
				path: path,
				className: opts.className,
				methodName: op['x-swagger-js-method-name'] ? op['x-swagger-js-method-name'] : (op.operationId ? op.operationId : getPathToMethodName(m, path)),
				method: m.toUpperCase(),
				isGET: m.toUpperCase() === 'GET',
				summary: op.description,
				isSecure: op.security !== undefined,
				parameters: []
			};
			method.responseModel = getResponseModelV2(op);
			method.contentTypes = mergeContentTypes(defaultContentType, op.consumes || []);

			var params = [];
			if (_.isArray(op.parameters)) {
				params = op.parameters;
			}
			params = params.concat(globalParams);
			_.chain(params).forEach(function(parameter) {
				if (_.isString(parameter.$ref)) {
					var segments = parameter.$ref.split('/');
					parameter = swagger.parameters[segments.length === 1 ? segments[0] : segments[2]];
				}
				parameter.camelCaseName = camelCase(parameter.name);
				if (parameter.enum && parameter.enum.length === 1) {
					parameter.isSingleton = true;
					parameter.singleton = parameter.enum[0];
				}
				if (parameter.in === 'body') {
					parameter.isBodyParameter = true;
				} else if (parameter.in === 'path') {
					parameter.isPathParameter = true;
				} else if (parameter.in === 'query') {
					if (parameter.pattern) {
						parameter.isPatternType = true;
					}
					parameter.isQueryParameter = true;
				} else if (parameter.in === 'header') {
					parameter.isHeaderParameter = true;
				} else if (parameter.in === 'formData') {
					parameter.isFormParameter = true;
				}
				method.parameters.push(parameter);
			});
			data.methods.push(method);
		});
	});
	return data;
};
/**
 * extract response model from specification - is supports on swagger v1.2
 * @param  {object} op [description]
 * @return {string}    name of type ..
 */
var getResponseModelV1 = function(op) {
	var responseModel = 'object'; // set default ..

	if (op.type !== undefined) {
		if (op.type.toLowerCase() === 'array' || op.type.toLowerCase() === 'list') {
			if (op.items !== null && op.items.hasOwnProperty('$ref')) {
				responseModel = op.items.$ref + '[]';
			}
		} else {
			responseModel = op.type;
		}
	}

	return responseModel;
};

var getViewForSwagger1 = function(opts, type) {
	var swagger = opts.swagger;
	var defaultContentType = [];
	var data = {
		isNode: type === 'node',
		description: swagger.description,
		moduleName: opts.moduleName,
		className: opts.className,
		domain: swagger.basePath ? swagger.basePath : '',
		methods: []
	};
	defaultContentType = swagger.consumes || [];
	swagger.apis.forEach(function(api) {
		api.operations.forEach(function(op) {
			var method = {
				path: api.path,
				className: opts.className,
				methodName: op.nickname,
				method: op.method,
				isGET: op.method === 'GET',
				summary: op.summary,
				parameters: op.parameters
			};
			method.responseModel = getResponseModelV1(op);
			method.contentTypes = mergeContentTypes(defaultContentType, op.consumes || []);
			op.parameters = op.parameters ? op.parameters : [];
			op.parameters.forEach(function(parameter) {
				parameter.camelCaseName = camelCase(parameter.name);
				if (parameter.enum && parameter.enum.length === 1) {
					parameter.isSingleton = true;
					parameter.singleton = parameter.enum[0];
				}
				if (parameter.paramType === 'body') {
					parameter.isBodyParameter = true;
				} else if (parameter.paramType === 'path') {
					parameter.isPathParameter = true;
				} else if (parameter.paramType === 'query') {
					if (parameter.pattern) {
						parameter.isPatternType = true;
					}
					parameter.isQueryParameter = true;
				} else if (parameter.paramType === 'header') {
					parameter.isHeaderParameter = true;
				} else if (parameter.paramType === 'form') {
					parameter.isFormParameter = true;
				}
			});
			data.methods.push(method);
		});
	});
	return data;
};

var getCode = function(opts, type) {
	var tpl, method, request;
	// For Swagger Specification version 2.0 value of field 'swagger' must be a string '2.0'
	var data = opts.swagger.swagger === '2.0' ? getViewForSwagger2(opts, type) : getViewForSwagger1(opts, type);
	if (type === 'custom') {
		if (!_.isObject(opts.template) || !_.isString(opts.template.class) || !_.isString(opts.template.method) || !_.isString(opts.template.request)) {
			throw new Error('Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }');
		}
		tpl = opts.template.class;
		method = opts.template.method;
		request = opts.template.request;
	} else {
		tpl = fs.readFileSync(__dirname + '/../templates/' + type + '-class.mustache', 'utf-8');
		method = fs.readFileSync(__dirname + '/../templates/method.mustache', 'utf-8');
		request = fs.readFileSync(__dirname + '/../templates/' + type + '-request.mustache', 'utf-8');
	}
	var source = Mustache.render(tpl, data, {
		method: method,
		request: request
	});
	lint(source, {
		node: type === 'node' || type === 'custom',
		browser: type === 'angular' || type === 'custom',
		undef: true,
		strict: true,
		trailing: true,
		smarttabs: true
	});
	lint.errors.forEach(function(error) {
		if (error.code[0] === 'E') {
			throw new Error(lint.errors[0].reason + ' in ' + lint.errors[0].evidence);
		}
	});
	return beautify(source, {
		indent_size: 4,
		max_preserve_newlines: 2
	});
};


exports.CodeGen = {
	getAngularCode: function(opts) {
		return getCode(opts, 'angular');
	},
	getNodeCode: function(opts) {
		return getCode(opts, 'node');
	},
	getCustomCode: function(opts) {
		return getCode(opts, 'custom');
	},
	getNodeModelCode: function(opts) {
		return CodeGenModel.getCodeGen(opts, 'node');
	},
	getNodeCustomModelCode: function(opts) {
		return CodeGenModel.getCodeGen(opts, 'custom');
	}
};