'use strict';

var assert = require('assert');
var vows = require('vows');
var fs = require('fs');
var ffs = require('final-fs');

var CodeGen = require('../lib/codegen').CodeGen;

var batch = {};
var list = ffs.readdirSync('tests/apis');

function verify(result, file, type) {
    var reference = file.replace(/^tests\/apis\//, 'tests/reference/' + type + '_');
    if (false) {
        fs.writeFileSync(reference, result, 'UTF-8');
    } else {        
        assert(result, fs.readFileSync(reference, 'UTF-8'));
    }
}

list.forEach(function(file){
    file = 'tests/apis/' + file;
    batch[file] = function(){
        var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
        var result = CodeGen.getNodeCode({
            className: 'Test',
            swagger: swagger
        });
        verify(result, file, 'node');
        result = CodeGen.getAngularCode({
            moduleName: 'Test',
            className: 'Test',
            swagger: swagger
        });
        verify(result, file, 'angular');
        result = CodeGen.getAngularCode({
            moduleName: 'Test',
            className: 'Test',
            swagger: swagger,
            lint: false,
            beautify: false
        });
        verify(result, file, 'angular-ugly');
        if(swagger.swagger === '2.0') {
            result = CodeGen.getTypescriptCode({
                moduleName: 'Test',
                className: 'Test',
                swagger: swagger,
                lint: false
            });
            verify(result, file, 'typescript');
        }
        result = CodeGen.getCustomCode({
            moduleName: 'Test',
            className: 'Test',
            swagger: swagger,
            template: {
                class: fs.readFileSync(__dirname + '/../templates/angular-class.mustache', 'utf-8'),
                method: fs.readFileSync(__dirname + '/../templates/method.mustache', 'utf-8'),
                request:fs.readFileSync(__dirname + '/../templates/angular-request.mustache', 'utf-8')
            }
        });
        verify(result, file, 'custom');
    };
});
vows.describe('Test Generation').addBatch(batch).export(module);
