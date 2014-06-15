exports.CodeGen = function(className, swagger){
    'use strict';
    
    var beautify = require('js-beautify').js_beautify;

    var params = function(){
    
    };

    var addMethod = function(op){
        return '\n\nthis.' + op.nickname + ' = function(' + params() + '){\n' +
    
        '};';
    };

    var addClass = function(source){
        return 'module.exports.' + className + ' = function(domain){\n"use strict";\nvar request = require("request");' + source + '\n};';
    };

    this.getCode = function(){
        var source = '';
        swagger.apis.forEach(function(api){
            api.operations.forEach(function(operation){
                source += addMethod(operation);
            });
        });
        source = addClass(source);
        return beautify(source, { indent_size: 2 });
    };
};