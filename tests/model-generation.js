'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
//var events = require('events');

var CodeGen = require('../lib/codegen.js').CodeGen;

vows.describe('Test Generated Models').addBatch({
    'Test model generation for models/model-test.json': {
        topic: function() {
            var swagger = JSON.parse(fs.readFileSync('tests/models/model-test.json', 'UTF-8'));

            var nameSpaceCode = CodeGen.getNodeModelCode({
                nameSpace: 'proj',
                swagger: swagger
            });
            var srcCode = nameSpaceCode.modelCodeSet;
            // pretend code generation ... 
            // the indented generate file structure is 
            
            var mockIndex = {};

            mockIndex[nameSpaceCode.nameSpace]={};

            // get out each defined model
            for (var item in srcCode) {
                /*jshint evil:true*/
                mockIndex.proj[item] = eval(srcCode[item].code);
            }

            return mockIndex;
        },
        'should have an object called proj (pretend nameSpace)':function(genModels) {
            assert.equal(genModels.proj!==null,true);
        },
        'should have an object with some proporties': function(genModels) {
            var propCounter = 0;
            for (var propName in genModels.proj) {
                if (genModels.proj.hasOwnProperty(propName)) {
                    ++propCounter;
                }
            }
            assert.equal(propCounter > 0, true);
        },
        'genModels should have an enum called ProjTestNameEnum ': function(genModels) {
            assert.equal(genModels.proj.TestNameEnum !== null, true);
        },
        'ProjTestNameEnum should have a property called ProjTestNameEnum.CONNECTION with value "connection"': function(genModels) {
            assert.equal(genModels.proj.TestNameEnum.CONNECTION === 'connection', true);
        },
        'genModels should have an object called ProjSubscription ': function(genModels) {
            assert.equal(genModels.proj.Subscription !== null, true);
        },
        'Should be able to create an instance of ProjSubscription called sub': {
            topic: function(genModels) {
                var sub = new genModels.proj.Subscription();
                assert.equal(sub !== null, true);
                return sub;
            },
            'sub should have a property called subscriptionAddOns': function(sub) {
                assert.equal(sub.subscriptionAddOns !== null, true);
            },
            'sub.subscriptionAddOns should be of type array': function(sub) {
                assert.equal(typeof(sub.subscriptionAddOns) === typeof([]), true);
            }
        }
    }
}).export(module);