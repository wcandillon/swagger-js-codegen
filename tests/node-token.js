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
            var Auth = eval(CodeGen.getNodeCode({ className: 'Auth', swagger: swagger }));
            return new Auth('https://portal.28.io/api');
        },
        'Should have auth method': function(auth){
            assert.equal(auth.auth !== undefined, true);
        },
        'Calling Auth method with correct password': {
            topic: function (auth) {
                var promise = new(events.EventEmitter)();
                auth.auth({
                    email: 'w+test@28.io',
                    password: 'foobar',
                    grant_type: 'client_credentials'
                }).then(function(result){
                    promise.emit('success', {result: result, auth: auth});
                }, function(result){
                    promise.emit('error', result);
                });
                return promise;
            },
            'Should have valid password': function (success) {
                success.auth.setToken(success.result.body.access_token);
                assert.equal(success.result.body.token_type, 'bearer');
            }
        }
    }
}).export(module);
