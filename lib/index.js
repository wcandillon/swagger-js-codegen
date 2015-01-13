'use strict';

var codeGen = require('./codegen.js').CodeGen;
var modelCodeGen = require('./codegen-model.js').CodeGenModel;

exports.CodeGen = {
    // done for backward compatibility with existing structure
    getAngularCode: function(opts) {
        return codeGen.getAngularCode(opts, 'angular');
    },
    getNodeCode: function(opts) {
        return codeGen.getNodeCode(opts, 'node');
    },
    getCustomCode: function(opts) {
        return codeGen.getCustomCode(opts, 'custom');
    },
    getNodeModelCode: function(opts) {
        return modelCodeGen.getNodeModelCode(opts);
    }
};