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
                assert.equal(camelCase('snake_with-kebab'), 'snake_withKebab');
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
                assert.equal(camelCase('snake_with-kebab'), 'snakeWithKebab');
            }
        }
    },
    'selectTemplates': {
        topic: function(){
            var locateTemplate = CodeGen.__get__('locateTemplate');
            CodeGen.__set__('readTemplate', function(path, language, framework, suffix) {
                return locateTemplate(path, language, framework, suffix);
            });
            return CodeGen.__get__('selectTemplates');
        },
        'should be backward-compatible': {
            topic: function(selectTemplates) {
                return selectTemplates; //_.curry(selectTemplates)({});
            },
            'with angular': function(selectTemplates) {
                var opts = {};
                var dirname = __dirname.replace(/tests$/, 'lib') + '/../templates/';
                selectTemplates(opts, 'angular');
                assert.equal(opts.template.class, dirname + 'angular-class.mustache');
                assert.equal(opts.template.method, dirname + 'method.mustache');
                assert.equal(opts.template.request, dirname + 'angular-request.mustache');
                assert.equal(opts.template.type, undefined);
            },
            'with node': function(selectTemplates) {
                var opts = {};
                var dirname = __dirname.replace(/tests$/, 'lib') + '/../templates/';
                selectTemplates(opts, 'node');
                assert.equal(opts.template.class, dirname + 'node-class.mustache');
                assert.equal(opts.template.method, dirname + 'method.mustache');
                assert.equal(opts.template.request, dirname + 'node-request.mustache');
                assert.equal(opts.template.type, undefined);
            },
            'with typescript': function(selectTemplates) {
                var opts = {};
                var dirname = __dirname.replace(/tests$/, 'lib') + '/../templates/';
                selectTemplates(opts, 'typescript');
                assert.equal(opts.template.class, dirname + 'typescript-class.mustache');
                assert.equal(opts.template.method, dirname + 'typescript-method.mustache');
                assert.equal(opts.template.request, dirname + 'typescript-request.mustache');
                assert.equal(opts.template.type, dirname + 'type.mustache');
            }
        }
    },
    'locateTemplate': {
        topic: function(){
            return CodeGen.__get__('locateTemplate');
        },
        'should find templates for language and framework': function(locateTemplate) {
            assert.equal(locateTemplate(__dirname + '/../templates/', 'typescript', 'angular', 'class.mustache'),
                __dirname + '/../templates/typescript-angular-class.mustache');
        },
        'should find templates for language': function(locateTemplate) {
            assert.equal(locateTemplate(__dirname + '/../templates/', 'typescript', undefined, 'class.mustache'),
                __dirname + '/../templates/typescript-class.mustache');
        },
        'should find templates for framework': function(locateTemplate) {
            assert.equal(locateTemplate(__dirname + '/../templates/', undefined, 'angular', 'class.mustache'),
                __dirname + '/../templates/angular-class.mustache');
        }
    }
}).export(module);
