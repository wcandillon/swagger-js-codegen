'use strict';

var vows = require('vows');
var assert = require('assert');
var rewire = require('rewire');

var CodeGen = rewire('../lib/codegen.js');

vows.describe('Test Utilities').addBatch({
    'camelCase': {
        topic: function(){
            return CodeGen.__get__('camelCase');
        },
        'should convert kebab-case to camelCase': function(camelCase){
            assert.equal(camelCase('alreadyCamel'), 'alreadyCamel');
            assert.equal(camelCase('kebab-case'), 'kebabCase');
            assert.equal(camelCase('double-kebab-case'), 'doubleKebabCase');
        }
    }
}).export(module);
