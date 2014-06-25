'use strict';

var nodeCodeGen = require('./node').CodeGen;
var angularCodeGen = require('./angular').CodeGen;

exports.CodeGen = {
    getAngularCode: function(opts){
        return (new angularCodeGen(opts.moduleName, opts.className, opts.swagger)).getCode();
    },
    getNodeCode: function(opts){
        return (new nodeCodeGen(opts.className, opts.swagger)).getCode();
    }
};
