'use strict';

var codeGen = require('./codegen.js').CodeGen;
var modelCodeGen = require('./codegen-model.js').CodeGenModel;

exports.CodeGen = {
    getAngularCode: function(opts){
        return codeGen.getCode(opts, 'angular');
    },
    getNodeCode: function(opts){
        return codeGen.getCode(opts, 'node');
    },
    getCustomCode: function(opts){
        return codeGen.getCode(opts, 'custom');
    },
    getNodeModelCode : function(opts) {
    	return modelCodeGen.getNodeModelCode(opts);
    }
};
