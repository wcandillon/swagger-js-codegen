'use strict';

var assert = require('assert');
var vows = require('vows');
var fs = require('fs');
var ffs = require('final-fs');
var _=require('lodash');
var CodeGen = require('../lib').CodeGen;

var batch = {};
var list = ffs.readdirSync('tests/apis');
list.forEach(function(file) {
    file = 'tests/apis/' + file;
    batch['model_'+file] = function() {
        var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
        var modelsDefined = swagger.swagger==='2.0' ? _.keys(swagger.definitions):_.keys(swagger.models);
        var models = CodeGen.getNodeModelCode({
            swagger: swagger
        });

        var propertyCoutner=0;
        for (var model in models) {
            propertyCoutner++;
            assert(typeof(models[model]),'string');
        }

        assert(modelsDefined.length <= propertyCoutner);
    };

});
vows.describe('Test Model Generation').addBatch(batch).export(module);