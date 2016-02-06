'use strict';

var assert = require('assert');
var rewire = require('rewire');
var vows = require('vows');
var _ = require('lodash');

var CodeGen = rewire('../lib/codegen.js');

vows.describe('Test Utilities').addBatch({
    'camelCase': {
        topic: function(){
            return CodeGen.__get__('camelCase');
        },
        'by default': {
            topic: function(camelCase) {
                return _.curry(camelCase)({});
            },
            'should leave camelCase as camelCase': function(camelCase) {
                assert.equal(camelCase('alreadyCamel'), 'alreadyCamel');
            },
            'should convert kebab-case to camelCase': function(camelCase) {
                assert.equal(camelCase('kebab-case'), 'kebabCase');
                assert.equal(camelCase('double-kebab-case'), 'doubleKebabCase');
            },
            'should not convert snake_case to camelCase': function(camelCase) {
                assert.equal(camelCase('snake_case'), 'snake_case');
                assert.equal(camelCase('double_snake_case'), 'double_snake_case');
            }
        },
        'when convertSnakeCase is true': {
            topic: function(camelCase) {
                return _.curry(camelCase)({convertSnakeCase: true});
            },
            'should leave camelCase as camelCase': function(camelCase) {
                assert.equal(camelCase('alreadyCamel'), 'alreadyCamel');
            },
            'should convert kebab-case to camelCase': function(camelCase) {
                assert.equal(camelCase('kebab-case'), 'kebabCase');
                assert.equal(camelCase('double-kebab-case'), 'doubleKebabCase');
            },
            'should convert snake_case to camelCase': function(camelCase) {
                assert.equal(camelCase('snake_case'), 'snakeCase');
                assert.equal(camelCase('double_snake_case'), 'doubleSnakeCase');
            }
        }

    }
}).export(module);
