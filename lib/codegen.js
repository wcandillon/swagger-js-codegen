'use strict';

var fs = require('fs');
var Mustache = require('mustache');
var beautify = require('js-beautify').js_beautify;
var lint = require('jshint').JSHINT;

var keywordMap = {
    'default': 'difault'
};

var camelCase = function(id) {
    var tokens = [];
    id = keywordMap[id] ? keywordMap[id] : id;
    id.split('-').forEach(function(token, index){
        if(index === 0) {
            tokens.push(token[0].toLowerCase() + token.substring(1));
        } else {
            tokens.push(token[0].toUpperCase() + token.substring(1));
        }
    });
    return tokens.join('');
};

var getView = function(opts){
    var swagger = opts.swagger;
    var data = {
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
                parameters: op.parameters,
                singletons: []
            };
            op.parameters = op.parameters ? op.parameters : [];
            op.parameters.forEach(function(parameter) {
                parameter.camelCaseName = camelCase(parameter.name);
                if(parameter.enum && parameter.enum.length === 1) {
                    method.singletons.push({ name: parameter.camelCaseName, value: parameter.enum[0] });
                } else {
                    if(parameter.paramType === 'body'){
                        parameter.isBodyParameter = true;
                    } else if(parameter.paramType === 'path'){
                        parameter.isPathParameter = true;
                    } else if(parameter.paramType === 'query'){
                        parameter.isQueryParameter = true;
                    } else if(parameter.paramType === 'header'){
                        parameter.isHeaderParameter = true;
                    }
                }
            });
            data.methods.push(method);
        });
    });
    return data;
};

var getCode = function(opts, type) {
    var data = getView(opts);
    var tpl = fs.readFileSync('lib/templates/' + type + '/class.mustache', 'utf-8');
    var source = Mustache.render(tpl, data, {
        method: fs.readFileSync('lib/templates/' + type + '/method.mustache', 'utf-8')
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
