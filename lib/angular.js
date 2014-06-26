exports.CodeGen = function(moduleName, className, swagger){
    'use strict';
    
    var beautify = require('js-beautify').js_beautify;
    var lint = require('jshint').JSHINT;

    var util = require('./util').util;

    var addMethod = function(path, op){
        var singletons = [];
        var parameters = [];
        op.parameters = op.parameters ? op.parameters : [];
        op.parameters.forEach(function(parameter) {
            parameter.camelCaseName = util.camelCase(parameter.name);
            if(parameter.enum && parameter.enum.length === 1) {
                singletons.push({ name: parameter.camelCaseName, value: parameter.enum[0] });
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
                parameters.push(parameter);
            }
        });
        return util.renderAsAngular('method', {
            className: className,
            methodName: op.nickname,
            method: op.method,
            isGET: op.method === 'GET',
            summary: op.summary,
            parameters: op.parameters,
            path: path
        });
    };

    var addClass = function(source){
        return util.renderAsAngular('class', {
            moduleName: moduleName,
            className: className,
            source: source
        });
    };

    this.getCode = function(){
        var source = '';
        swagger.apis.forEach(function(api){
            api.operations.forEach(function(operation){
                source += addMethod(api.path, operation);
            });
        });
        source = addClass(source);
        lint(source, {
            sub: true
        });
        lint.errors.forEach(function(error){
            throw new Error(error.reason + ' in ' + error.evidence);
        });
        return beautify(source, { indent_size: 4 });
    };
};
