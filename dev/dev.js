'use strict';

var CodeGen = require('../lib').CodeGen;
var fs = require('fs');
var _=require('lodash');

var file='tests/apis/uber.json';
//var file='cr.swagger.json';
var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));


var modelsDefined = swagger.swagger === '2.0' ? _.keys(swagger.definitions) : _.keys(swagger.models);
console.log(modelsDefined);

var models = CodeGen.getNodeModelCode({
    swagger: swagger
});

var keys = _.keys(models);
keys.forEach(function(item) {
    keys.push(item);
    console.log(models[item]);
});
console.log(keys);