'use strict';

var codeGen = require('./codegen.js').CodeGen;
var modelCodeGen = require('./codegen-model.js').CodeGenModel;

exports.CodeGen = {
    // done for backward compatibility with existing structure
    getAngularCode: function(opts) {
        return codeGen.getCodeGen(opts, 'angular');
    },
    getNodeCode: function(opts) {
        return codeGen.getCodeGen(opts, 'node');
    },
    getCustomCode: function(opts) {
        return codeGen.getCodeGen(opts, 'custom');
    },
    getNodeModelCode: function(opts) {
        return modelCodeGen.getCodeGen(opts,'node');
    },
    getNodeCustomModelCode : function(opts) {
        return modelCodeGen.getCodeGen(opts,'custom');
    }
};