'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
var events = require('events');

var CodeGen = require('../lib/codegen').CodeGen;

vows.describe('Test Token').addBatch({
    'Test Automatic Auth Token Assignment': {
        topic: function(){
            var swagger = JSON.parse(fs.readFileSync('tests/apis/token.json', 'UTF-8'));
            /*jshint evil:true*/
            var Token = eval(CodeGen.getNodeCode({ className: 'Token', swagger: swagger }));
            return new Token('https://portal.28.io/api');
        },
        'Should have auth and getSecure methods': function(token){
            assert.equal(token.auth !== undefined, true);
            assert.equal(token.getSecure !== undefined, true);
        },
        'Calling auth method with correct password': {
            topic: function (token) {
                var promise = new(events.EventEmitter)();
                token.auth({
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
            'Should have valid password': function (result) {
                assert.equal(result.body.token_type, 'bearer');
            },
            'Calling operation with token': {
                topic: function (result) {
                    var swagger = JSON.parse(fs.readFileSync('tests/apis/token.json', 'UTF-8'));
                    /*jshint evil:true*/
                    var Token = eval(CodeGen.getNodeCode({ className: 'Token', swagger: swagger }));

                    var projectName = result.body.projectsMetadata[0].name;
                    var accessToken = result.body.access_token;

                    var token = new Token('https://' + projectName + '.28.io');
                    token.setToken(accessToken, 'token', true);

                    var promise = new(events.EventEmitter)();
                    token.getSecure().then(function(result){
                        promise.emit('success', result);
                    }, function(result){
                        promise.emit('error', result);
                    });
                    return promise;
                },
                'Should have unauthorized response': function (err, result) {
                    assert.equal(err.body.message, 'Unauthorized');
                }
            }
        }
    }
}).export(module);
