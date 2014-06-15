'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
var ffs = require('final-fs');

var CodeGen = require('../lib/codegen').CodeGen;

var batch = {};
var list = ffs.readdirSync('swagger');
list.forEach(function(file){
    file = 'swagger/' + file;
    batch[file] = function(){
        var swagger = fs.readFileSync(file, 'UTF-8');
        var gen = new CodeGen('Queries', JSON.parse(swagger));
        gen.getCode();
    };
});
vows.describe('Test Generation').addBatch(batch).export(module);
