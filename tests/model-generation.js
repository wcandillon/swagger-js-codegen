'use strict';

var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
//var events = require('events');

var CodeGen = require('../lib/codegen').CodeGen;
console.log('goo');
var swagger = JSON.parse(fs.readFileSync('tests/models/model-1.json', 'UTF-8'));
console.log(swagger);
var srcCode = CodeGen.getNodeModelCode({
    nameSpace: 'proj',
    swagger: swagger
});
fs.writeFileSync('./foo.js', srcCode);

console.log(srcCode);
vows.describe('Test Generated API').addBatch({
    'Test model generation for models/model-1.json': {
        topic: function() {
            var swagger = JSON.parse(fs.readFileSync('tests/models/model-1.json', 'UTF-8'));
            /*jshint evil:true*/
            var srcCode = CodeGen.getNodeModelCode({
                nameSpace: 'proj',
                swagger: swagger
            });
            fs.writeFileSync('./foo.js', srcCode);
            //            console.log(srcCode);
            var code = [];
            for (var item in srcCode) {
                console.log(item.srcCode);
            }
            return code; //new Auth('https://portal.28.io/api');
        },
        'Should have an object ': function(code) {
                assert.equal(code !== null, true);
            }
            // 'Calling Authenticate method with missing parameters': {
            //     topic: function(auth){
            //         var promise = new(events.EventEmitter)();
            //         var callback = function(result){
            //             promise.emit('success', result);
            //         };
            //         auth.authenticate({
            //             email: 'w+test@28.io'
            //         }).then(callback, callback);
            //         return promise;
            //     },
            //     'Should have missing parameter error': function(error){
            //         assert.equal(error.message, 'Missing required query parameter: grant_type');
            //     }
            // },
            // 'Calling Authenticate method with wrong password': {
            //     topic: function(auth){
            //         var promise = new(events.EventEmitter)();
            //         var callback = function(result){
            //             promise.emit('success', result);
            //         };
            //         auth.authenticate({
            //             email: 'w+test@28.io',
            //             password: 'foobartest',
            //             grant_type: 'client_credentials'
            //         }).then(callback, callback);
            //         return promise;
            //     },
            //     'Should have invalid password': function(error){
            //         assert.equal(
            //             error.body.message.substring(0, '[errors:wrong-password]'.length),
            //             '[errors:wrong-password]'
            //         );
            //     }
            // },
            // 'Calling Authenticate method with correct password': {
            //     topic: function(auth){
            //         var promise = new(events.EventEmitter)();
            //         auth.authenticate({
            //             email: 'w+test@28.io',
            //             password: 'foobar',
            //             grant_type: 'client_credentials'
            //         }).then(function(result){
            //             promise.emit('success', result);
            //         }, function(result){
            //             promise.emit('error', result);
            //         });
            //         return promise;
            //     },
            //     'Should have valid password': function(success){
            //         assert.equal(success.body.token_type, 'bearer');
            //     }
            // }
    }
}).export(module);


/*var batch = {};
var list = ffs.readdirSync('tests/apis');
list.forEach(function(file) {
    file = 'tests/models/m' + file;
    batch['model_'+file] = function() {
        var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
        var modelsDefined = swagger.swagger==='2.0' ? _.keys(swagger.definitions):_.keys(swagger.models);
        var models = CodeGen.getNodeModelCode({
            swagger: swagger
        });

        var propertyCoutner=0;
        for (var model in models) {
            propertyCoutner++;
            assert(typeof(models[model]),'string');
        }

        assert(modelsDefined.length <= propertyCoutner);
    };

});
vows.describe('Test Model Generation').addBatch(batch).export(module);*/