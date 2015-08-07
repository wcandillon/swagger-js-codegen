'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');

var CodeGen = require('../lib/codegen').CodeGen;

vows.describe('Test generation of TypeScript definitions').addBatch({
    'The generated code from petstore-simple.json': {
        topic: function(){
            var swagger = JSON.parse(fs.readFileSync('tests/apis/petstore-simple.json', 'UTF-8'));
            return CodeGen.getAngularTypeScriptDefinition({className: 'Petstore', swagger: swagger, dtsRefs: ['foo.d.ts', 'bar.d.ts']});
        },
        'should be equal to the expected result': function(generated){
            var expected = fs.readFileSync('tests/expected/petstore-simple.d.ts', {encoding: 'UTF-8'});
            assert.equal(generated, expected);
        }
    }
}).export(module);
