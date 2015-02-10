'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
var events = require('events');

var CodeGen = require('../lib/codegen').CodeGen;

vows.describe('Test Protected').addBatch({
    'Test Automatic Auth Token Assignment': {
        topic: function(){
            var swagger = JSON.parse(fs.readFileSync('tests/apis/protected.json', 'UTF-8'));
            /*jshint evil:true*/
            var ProtectedAPI = eval(CodeGen.getNodeCode({ className: 'Protected', swagger: swagger }));
            return new ProtectedAPI('https://portal.28.io/api');
        },
        'Should have auth and getSecure methods': function(protectedAPI){
            assert.equal(protectedAPI.auth !== undefined, true);
            assert.equal(protectedAPI.getSecure !== undefined, true);
        },
        'Calling auth method with correct password': {
            topic: function (protectedAPI) {
                var promise = new(events.EventEmitter)();
                protectedAPI.auth({
                    email: 'w+test@28.io',
                    password: 'foobar',
                    grant_type: 'client_credentials'
                }).then(function(result){
                    promise.emit('success', {retval: result, protectedAPI: protectedAPI});
                }, function(result){
                    promise.emit('error', {retval: result, protectedAPI: protectedAPI});
                });
                return promise;
            },
            'Should have valid password': function (result) {
                assert.equal(result.retval.body.token_type, 'bearer');
            },
            'Calling operation with good token': {
                topic: function (result) {
                    result.protectedAPI.setToken(result.retval.body.access_token, 'token', true);

                    var promise = new(events.EventEmitter)();
                    result.protectedAPI.getSecure().then(function(result){
                        promise.emit('success', result);
                    }, function(result){
                        promise.emit('error', result);
                    });
                    return promise;
                },
                'Should have good response': function (result) {
                    assert.equal(result.response.statusCode, 200);
                }
            },
            'Calling operation with wrong token': {
                topic: function (result) {
                    result.protectedAPI.setToken(result.retval.body.access_token.slice(1), 'token', true);

                    var promise = new(events.EventEmitter)();
                    result.protectedAPI.getSecure().then(function(result){
                        promise.emit('success', result);
                    }, function(result){
                        promise.emit('error', result);
                    });
                    return promise;
                },
                'Should have unauthorized response': function (err, result) {
                    assert.equal(err.response.statusCode, 401);
                    assert.strictEqual(result, undefined);
                }
            }
        }
    }
}).export(module);
