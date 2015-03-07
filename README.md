#Swagger to JS Codegen
[![Build Status](http://img.shields.io/travis/wcandillon/swagger-js-codegen/master.svg?style=flat)](https://travis-ci.org/wcandillon/swagger-js-codegen) [![NPM version](http://img.shields.io/npm/v/swagger-js-codegen.svg?style=flat)](http://badge.fury.io/js/swagger-js-codegen) [![Code Climate](http://img.shields.io/codeclimate/github/wcandillon/swagger-js-codegen.svg?style=flat)](https://codeclimate.com/github/wcandillon/swagger-js-codegen)

This package generates a nodejs or angularjs class from a [swagger specification file](https://github.com/wordnik/swagger-spec). Also for nodejs generates the models of the objects defined in [swagger specification file](https://github.com/wordnik/swagger-spec).The code is generated using [mustache templates](https://github.com/wcandillon/swagger-js-codegen/tree/master/lib/templates) and is quality checked by [jshint](https://github.com/jshint/jshint/) and beautified by [js-beautify](https://github.com/beautify-web/js-beautify).

##Installation
```bash
npm install swagger-js-codegen
```

##Example
```javascript
var fs = require('fs');
var CodeGen = require('swagger-js-codegen').CodeGen;

var file = 'swagger/spec.json';
var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
var nodejsSourceCode = CodeGen.getNodeCode({ className: 'Test', swagger: swagger }); 
var angularjsSourceCode = CodeGen.getAngularCode({ className: 'Test', swagger: swagger }); 
console.log(nodejsSourceCode);
console.log(angularjsSourceCode);
```

##Custom template
```javascript
var source = CodeGen.getCustomCode({
    moduleName: 'Test',
    className: 'Test',
    swagger: swaggerSpec, 
    template: {
        class: fs.readFileSync('my-class.mustache', 'utf-8'),
        method: fs.readFileSync('my-method.mustache', 'utf-8'),
        request:fs.readFileSync('my-request.mustache', 'utf-8') 
    }
});

// generate nodejs models
// set cameCaseFileName to false (default) to create file name in lower case 
//   e.g. testmodel.js or test-enum.js.
// otherwise the file name will follow the case convension defined in swagger file.

var nodejsModel = CodeGen.getNodeModelCode( {swagger: swagger, camelCaseFileName : false });})

console.log(nodejsSourceCode);
console.log(angularjsSourceCode);

for (var model in nodejsModel) {
    console.log('source file name : '+ nodejsModel[model].fileName);
    console.log('source code : '+ nodejsModel[model].sourceCode);
});
```

## Grunt task
[There is a grunt task](https://github.com/wcandillon/grunt-swagger-js-codegen) that enables you to integrate the code generation in your development pipeline. This is extremely convenient if your application is using APIs which are documented/specified in the swagger format.

##Who is using it?
The [CellStore](https://github.com/28msec/cellstore) project.

[28.io](http://28.io) is using this project to generate their [nodejs](https://github.com/28msec/28.io-nodejs) and [angularjs language bindings](https://github.com/28msec/28.io-angularjs).
