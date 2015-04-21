#Swagger to JS Codegen
[![Build Status](http://img.shields.io/travis/wcandillon/swagger-js-codegen/master.svg?style=flat)](https://travis-ci.org/wcandillon/swagger-js-codegen) [![NPM version](http://img.shields.io/npm/v/swagger-js-codegen.svg?style=flat)](http://badge.fury.io/js/swagger-js-codegen) [![Code Climate](http://img.shields.io/codeclimate/github/wcandillon/swagger-js-codegen.svg?style=flat)](https://codeclimate.com/github/wcandillon/swagger-js-codegen)

This package generates a nodejs or angularjs class from a [swagger specification file](https://github.com/wordnik/swagger-spec). The code is generated using [mustache templates](https://github.com/wcandillon/swagger-js-codegen/tree/master/lib/templates) and is quality checked by [jshint](https://github.com/jshint/jshint/) and beautified by [js-beautify](https://github.com/beautify-web/js-beautify).

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
        request: fs.readFileSync('my-request.mustache', 'utf-8')
    }
});
```

##Options
In addition to the common options listed below, `getCustomCode()` *requires* a `template` field:

    template: { class: "...", method: "...", request: "..." }

`getAngularCode()`, `getNodeCode()`, and `getCustomCode()` each support the following options:

```
  - moduleName
  - className
  - esnext
  - mustache
  - swagger
    - swagger (1.2 or 2.0)
    - info
      - description
    - securityDefinitions
    - parameters
      - name
      - enum
      - in
```

For more details see [options-schema.md](docs/options-schema.md)

###Template Variables
The following data are passed to the [mustache templates](https://github.com/janl/mustache.js):

```
- isNode
- description
- isSecure
- moduleName
- className
- domain
- methods:
  - path, className, methodName, method (GET, POST etc), isGET, summary, isSecure
  - parameters:
    - camelCaseName, isSingleton, singleton, isBodyParameter, isPathParameter...
```
For more details see [template-vars-schema.md](docs/template-vars-schema.md)

####Custom Mustache Variables
You can also pass in your own variables for the mustache templates by adding a `mustache` object:

```javascript
var source = CodeGen.getCustomCode({
    ...
    mustache: {
      foo: 'bar',
      app_build_id: env.BUILD_ID,
      app_version: pkg.version
    }
});
```

##Swagger Extensions

- [`x-swagger-js-method-name`](docs/x-swagger-js-method-name.md)
- [`x-proxy-header`](docs/x-proxy-header.md)


## Grunt & Gulp task
[There is a grunt task](https://github.com/wcandillon/grunt-swagger-js-codegen) that enables you to integrate the code generation in your development pipeline. This is extremely convenient if your application is using APIs which are documented/specified in the swagger format.

And example of gulp task is available [here](https://github.com/28msec/cellstore/blob/master/tasks/swagger.js).

## Using the Generated Code
### AngularJS

The AngularJS services are implemented as a Factory Factory so that a base URL, cache & token can be configured differently for testing and production.

```javascript
angular.module('demo', ['MyAPI'])
    .factory('API', function(MyAPI, API_URL) {
        'use strict';
        return {
            MyAPI_A: new MyAPI(API_URL + '/a/demo'),
            MyAPI_B: new MyAPI({
                domain: API_URL + '/b/demo',
                cache: cache,
                token: token
            })
        };
    })
    .controller('myController', ['API', function (API) {
        this.record = API.MyAPI_A.getRecordById(123);
    }]);
```

## Who is using it?
The [CellStore](https://github.com/28msec/cellstore) project.

[28.io](http://28.io) is using this project to generate their [nodejs](https://github.com/28msec/28.io-nodejs) and [angularjs language bindings](https://github.com/28msec/28.io-angularjs).
