'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
var events = require('events');

var CodeGen = require('../lib/codegen').CodeGen;

vows.describe('Test Generated API').addBatch({
    'Test Generated code for the 28.io Auth API': {
        topic: function(){
            var swagger = JSON.parse(fs.readFileSync('tests/apis/auth.json', 'UTF-8'));
            /*jshint evil:true*/
            var Auth = eval(CodeGen.getNodeCode({ className: 'Auth', swagger: swagger }));
            return new Auth('http://portal.28.io/api');
        },
        'Should have authenticate method': function(auth){
            assert.equal(auth.authenticate !== undefined, true);
        },
        'Calling Authenticate method with missing parameters': {
            topic: function(auth){
                var promise = new(events.EventEmitter)();
                var callback = function(result){
                    promise.emit('success', result);
                };
                auth.authenticate({
                    email: 'w+test@28.io'
                }).then(callback, callback);
                return promise;
            },
            'Should have missing parameter error': function(error){
                assert.equal(error.message, 'Missing required query parameter: grantType');
            }
        },
        'Calling Authenticate method with wrong password': {
            topic: function(auth){
                var promise = new(events.EventEmitter)();
                var callback = function(result){
                    promise.emit('success', result);
                };
                auth.authenticate({
                    email: 'w+test@28.io',
                    password: 'foobartest',
                    grantType: 'client_credentials'
                }).then(callback, callback);
                return promise;
            },
            'Should have invalid password': function(error){
                assert.equal(
                    error.body.message.substring(0, '[errors:wrong-password]'.length),
                    '[errors:wrong-password]'
                );
            }
        },
        'Calling Authenticate method with correct password': {
            topic: function(auth){
                var promise = new(events.EventEmitter)();
                auth.authenticate({
                    email: 'w+test@28.io',
                    password: 'foobar',
                    grantType: 'client_credentials'
                }).then(function(result){
                    promise.emit('success', result);
                }, function(result){
                    promise.emit('error', result);
                });
                return promise;
            },
            'Should have valid password': function(success){
                assert.equal(success.body.token_type, 'bearer');
            }
        }
    }
}).export(module);
