'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
var events = require('events');

var CodeGen = require('../lib/codegen').CodeGen;

function createAPI (options) {
    var swagger = JSON.parse(fs.readFileSync('tests/apis/protected.json', 'UTF-8'));
    /*jshint evil:true*/
    var ProtectedAPI = eval(CodeGen.getNodeCode({ className: 'Protected', swagger: swagger }));
    return new ProtectedAPI(options);
}

vows.describe('Test Protected').addBatch({
    'Test Automatic Auth Token Assignment': {
        topic: function(){
            return createAPI();
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
                    grantType: 'client_credentials'
                }).then(function(result){
                    promise.emit('success', result);
                }, function(result){
                    promise.emit('error', result);
                });
                return promise;
            },
            'Should have valid password': function (result) {
                assert.equal(result.body.token_type, 'bearer');
            },
            'Calling operation with good token': {
                topic: function (result) {
                    var protectedAPI = createAPI();

                    protectedAPI.setToken(result.body.access_token, 'token', true);

                    var promise = new(events.EventEmitter)();
                    protectedAPI.getSecure().then(function(result){
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
                    var protectedAPI = createAPI();

                    protectedAPI.setToken(result.body.access_token.slice(1), 'token', true);

                    var promise = new(events.EventEmitter)();
                    protectedAPI.getSecure().then(function(result){
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
            },
            'Overriding bad token with good one on the operation call': {
                topic: function (result) {
                    var protectedAPI = createAPI();

                    protectedAPI.setToken(result.body.access_token.slice(1), 'token', true);

                    var promise = new(events.EventEmitter)();
                    protectedAPI.getSecure({token: result.body.access_token}).then(function(result){
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
            'Overriding good token with bad one on the operation call': {
                topic: function (result) {
                    var protectedAPI = createAPI();

                    protectedAPI.setToken(result.body.access_token, 'token', true);

                    var promise = new(events.EventEmitter)();
                    protectedAPI.getSecure({token: result.body.access_token.slice(1)}).then(function(result){
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
            },
            'Calling operation with good token set in the constructor': {
                topic: function (result) {
                    var protectedAPI = createAPI({token: {value: result.body.access_token, headerOrQueryName: 'token', isQuery: true}});

                    var promise = new(events.EventEmitter)();
                    protectedAPI.getSecure().then(function(result){
                        promise.emit('success', result);
                    }, function(result){
                        promise.emit('error', result);
                    });
                    return promise;
                },
                'Should have unauthorized response': function (result) {
                    assert.equal(result.response.statusCode, 200);
                }
            },
            'Calling operation with bad token that overrides good token set in the constructor': {
                topic: function (result) {
                    var protectedAPI = createAPI({token: {value: result.body.access_token, headerOrQueryName: 'token', isQuery: true}});

                    var promise = new(events.EventEmitter)();
                    protectedAPI.getSecure({token: result.body.access_token.slice(1)}).then(function(result){
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
            },
            'Calling operation with good token that overrides bad token set in the constructor': {
                topic: function (result) {
                    var protectedAPI = createAPI({token: {value: result.body.access_token.slice(1), headerOrQueryName: 'token', isQuery: true}});

                    var promise = new(events.EventEmitter)();
                    protectedAPI.getSecure({token: result.body.access_token}).then(function(result){
                        promise.emit('success', result);
                    }, function(result){
                        promise.emit('error', result);
                    });
                    return promise;
                },
                'Should have unauthorized response': function (result) {
                    assert.equal(result.response.statusCode, 200);
                }
            },
            'Calling operation with good token that overrides empty options in the constructor': {
                topic: function (result) {
                    var protectedAPI = createAPI({});

                    protectedAPI.setToken(result.body.access_token, 'token', true);

                    var promise = new(events.EventEmitter)();
                    protectedAPI.getSecure().then(function(result){
                        promise.emit('success', result);
                    }, function(result){
                        promise.emit('error', result);
                    });
                    return promise;
                },
                'Should have unauthorized response': function (result) {
                    assert.equal(result.response.statusCode, 200);
                }
            }
        }
    }
}).export(module);
