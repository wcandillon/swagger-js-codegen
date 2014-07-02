'use strict';

var fs = require('fs');
var Mustache = require('mustache');
var beautify = require('js-beautify').js_beautify;
var lint = require('jshint').JSHINT;

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

var getView = function(opts, type){
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
                }
            });
            data.methods.push(method);
        });
    });
    return data;
};

var getCode = function(opts, type) {
    var data = getView(opts, type);
    var tpl = fs.readFileSync(__dirname + '/../templates/' + type + '-class.mustache', 'utf-8');
    var method = fs.readFileSync(__dirname + '/../templates/method.mustache', 'utf-8');
    var request = fs.readFileSync(__dirname + '/../templates/' + type + '-request.mustache', 'utf-8');
    var source = Mustache.render(tpl, data, {
        method: method,
        request: request
    });
    lint(source, {
        node: type === 'node',
        browser: type === 'angular',
        sub: true,
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
    }
};
