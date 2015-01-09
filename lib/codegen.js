'use strict';

var fs = require('fs');
var Mustache = require('mustache');
var beautify = require('js-beautify').js_beautify;
var lint = require('jshint').JSHINT;
var _ = require('lodash');

var camelCase = function(id) {
    var tokens = [];
    id.split('-').forEach(function(token, index){
        if(index === 0) {
            tokens.push(token[0].toLowerCase() + token.substring(1));
        } else {
            tokens.push(token[0].toUpperCase() + token.substring(1));
        }
    });
    return tokens.join('');
};

var getPathToMethodName = function(m, path){
    var segments = path.split('/').slice(1);
    segments = _.transform(segments, function(result, segment){
        if(segment[0] === '{' && segment[segment.length - 1] === '}') {
            segment = 'by' + segment[1].toUpperCase() + segment.substring(2, segment.length - 1);
        }
        result.push(segment);
    });
    var result = camelCase(segments.join('-'));
    return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

var getViewForSwagger2 = function(opts, type){
    var swagger = opts.swagger;
    var authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLIK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'];
    var data = {
        isNode: type === 'node',
        description: swagger.info.description,
        moduleName: opts.moduleName,
        className: opts.className,
        methods: []
    };

    _.forEach(swagger.paths, function(api, path){
        _.forEach(api, function(op, m){
            if(authorizedMethods.indexOf(m) === -1) {
                return;
            }
            var method = {
                path: path,
                className: opts.className,
                methodName: op.operationId ? op.operationId : getPathToMethodName(m, path),
                method: m.toUpperCase(),
                isGET: m.toUpperCase() === 'GET',
                summary: op.description,
                parameters: op.parameters
            };
            _.chain(op.parameters).forEach(function(parameter) {
                if ('$ref' in parameter) {
                    if (parameter.$ref in swagger.parameters) {
                        parameter = swagger.parameters[parameter.$ref];
                    }
                }
                parameter.camelCaseName = camelCase(parameter.name);
                if(parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }
                if(parameter.in === 'body'){
                    parameter.isBodyParameter = true;
                } else if(parameter.in === 'path'){
                    parameter.isPathParameter = true;
                } else if(parameter.in === 'query'){
                    parameter.isQueryParameter = true;
                } else if(parameter.in === 'header'){
                    parameter.isHeaderParameter = true;
                }
            });
            data.methods.push(method);
        });
    });
    return data;
};

var getViewForSwagger1 = function(opts, type){
    var swagger = opts.swagger;
    var data = {
        isNode: type === 'node',
        description: swagger.description,
        moduleName: opts.moduleName,
        className: opts.className,
        methods: []
    };
    swagger.apis.forEach(function(api){
        api.operations.forEach(function(op){
            var method = {
                path: api.path,
                className: opts.className,
                methodName: op.nickname,
                method: op.method,
                isGET: op.method === 'GET',
                summary: op.summary,
                parameters: op.parameters
            };
            op.parameters = op.parameters ? op.parameters : [];
            op.parameters.forEach(function(parameter) {
                parameter.camelCaseName = camelCase(parameter.name);
                if(parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }
                if(parameter.paramType === 'body'){
                    parameter.isBodyParameter = true;
                } else if(parameter.paramType === 'path'){
                    parameter.isPathParameter = true;
                } else if(parameter.paramType === 'query'){
                    parameter.isQueryParameter = true;
                } else if(parameter.paramType === 'header'){
                    parameter.isHeaderParameter = true;
                } else if(parameter.paramType === 'form'){
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
    if(type === 'custom') {
        if(!_.isObject(opts.template) || !_.isString(opts.template.class)  || !_.isString(opts.template.method) || !_.isString(opts.template.request)) {
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
    lint.errors.forEach(function(error){
        if(error.code[0] === 'E') {
            throw new Error(lint.errors[0].reason + ' in ' + lint.errors[0].evidence);
        }
    });
    return beautify(source, { indent_size: 4, max_preserve_newlines: 2 });
};

exports.CodeGen = {
    getAngularCode: function(opts){
        return getCode(opts, 'angular');
    },
    getNodeCode: function(opts){
        return getCode(opts, 'node');
    },
    getCustomCode: function(opts){
        return getCode(opts, 'custom');
    }
};
