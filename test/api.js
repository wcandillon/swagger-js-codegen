'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
var ffs = require('final-fs');
var events = require('events');
var path = require("path");

var CodeGen = require('../lib/codegen').CodeGen;

vows.describe('Test Generated API').addBatch({
    'Test Generated code for the 28.io Auth API': {
        topic: function(){
            var swagger = JSON.parse(fs.readFileSync('swagger/auth', 'UTF-8'));
            var gen = new CodeGen('Auth', swagger);
            var Auth = eval(gen.getCode());
            return new Auth('http://portal.28.io/api');
        },
        'Should have authenticate method': function(auth){
            assert.equal(auth.authenticate !== undefined, true);
        },
        'Calling Authenticate method with missing parameters': {
            topic: function(auth){
                var promise = new(events.EventEmitter);
                var callback = function(result){
                    promise.emit('success', result);  
                };
                auth.authenticate({
                    email: 'w+test@28.io'
                }).then(callback, callback);
                return promise;
            },
            'Should have missing parameter error': function(error){
                assert.equal(error, 'Missing required query parameter: grant_type');
            }
        },
        'Calling Authenticate method with wrong password': {
            topic: function(auth){
                var promise = new(events.EventEmitter);
                var callback = function(result){
                    promise.emit('success', result);  
                };
                auth.authenticate({
                    email: 'w+test@28.io',
                    password: 'foobartest',
                    grant_type: 'client_credentials'
                }).then(callback, callback);
                return promise;
            },
            'Should have invalid password': function(error){
                assert.equal(
                    JSON.parse(error.body).message.substring(0, '[errors:wrong-password]'.length),
                    '[errors:wrong-password]'
                );
            }
        },
        'Calling Authenticate method with correct password': {
            topic: function(auth){
                var promise = new(events.EventEmitter);
                auth.authenticate({
                    email: 'w+test@28.io',
                    password: 'foobar',
                    grant_type: 'client_credentials'
                }).then(function(result){
                    promise.emit('success', result);  
                }, function(result){
                    promise.emit('error', result);  
                });
                return promise;
            },
            'Should have valid password': function(success){
                var response = JSON.parse(success.body);
                assert.equal(response.token_type, 'bearer');
            }
        }
    }
}).export(module);