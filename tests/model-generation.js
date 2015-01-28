'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
//var events = require('events');

var CodeGen = require('../lib').CodeGen;

vows.describe('Test Generated Models').addBatch({
    'Test model generation for models/model-1.json': {
        topic: function() {
            var swagger = JSON.parse(fs.readFileSync('tests/models/model-1.json', 'UTF-8'));

            var srcCode = CodeGen.getNodeModelCode({
                nameSpace: 'proj',
                swagger: swagger
            });

            var genModels = {};
            // get out each defined model
            for (var item in srcCode) {
                /*jshint evil:true*/
                genModels[item] = eval(srcCode[item].code);
            }

            return genModels;
        },
        'should have an object with some proporties': function(genModels) {
            var propCounter = 0;
            for (var propName in genModels) {
                if (genModels.hasOwnProperty(propName)) {
                    ++propCounter;
                }
            }
            assert.equal(propCounter > 0, true);
        },
        'genModels should have an enum called ProjTestNameEnum ': function(genModels) {
            assert.equal(genModels.ProjTestNameEnum !== null, true);
        },
        'ProjTestNameEnum should have a propert called ProjTestNameEnum.CONNECTION with value "connection"': function(genModels) {
            assert.equal(genModels.ProjTestNameEnum.CONNECTION === 'connection', true);
        },
        'genModels should have an object called ProjSubscription ': function(genModels) {
            assert.equal(genModels.ProjSubscription !== null, true);
        },
        'Should be able to create an instance of ProjSubscription ': {
            topic: function(genModels) {
                var sub = new genModels.ProjSubscription();
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