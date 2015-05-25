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

```yaml
  moduleName:
    type: string
    description: Your AngularJS module name
  className:
    type: string
  stripPathPrefix:
    type: string
    description: removes a prefix from the API path from being used as method names.
  esnext:
    type: boolean
    description: passed through to jslint
  mustache:
    type: object
    description: See the 'Custom Mustache Variables' section below
  swagger:
    type: object
    required: true
    properties:
      swagger:
        description: |
          For Swagger Specification version 2.0 value of field 'swagger' must be a string '2.0'
        type: string
        enum:
        - 2.0
        - 1.2
      info:
        type: object
        properties:
          description:
            type: string
            description: Made available to templates as '{{&description}}'
      securityDefinitions:
        type: object
        description:
      parameters:
        type: array
        items:
          type: object
          properties:
            name:
              type: string
              required: true
            enum:
              type: array
            in:
              type: string
              enum:
              - body
              - path
              - query
              - header
              - formData
```

###Template Variables
The following data are passed to the [mustache templates](https://github.com/janl/mustache.js):

```yaml
isNode:
  type: boolean
description:
  type: string
  description: Provided by your options field: 'swagger.info.description'
isSecure:
  type: boolean
  description: false unless 'swagger.securityDefinitions' is defined
moduleName:
  type: string
  description: Your AngularJS module name - provided by your options field
className:
  type: string
  description: Provided by your options field
domain:
  type: string
  description: If all options defined: swagger.schemes[0] + '://' + swagger.host + swagger.basePath
methods:
  type: array
  items:
    type: object
    properties:
      path:
        type: string
      className:
        type: string
        description: Provided by your options field
      methodName:
        type: string
        description: Generatated from the HTTP method and path elements or 'x-swagger-js-method-name' field
      method:
        type: string
        description: 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLIK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'
        enum:
        - GET
        - POST
        - PUT
        - DELETE
        - PATCH
        - COPY
        - HEAD
        - OPTIONS
        - LINK
        - UNLIK
        - PURGE
        - LOCK
        - UNLOCK
        - PROPFIND
      isGET:
        type: string
        description: true if method === 'GET'
      summary:
        type: string
        description: Provided by the 'description' field in the schema
      isSecure:
        type: boolean
        description: true if the 'security' is defined for the method in the schema
      parameters:
        type: array
        description: Includes all of the properties defined for the parameter in the schema plus:
        items:
          camelCaseName:
            type: string
          isSingleton:
            type: boolean
            description: true if there was only one 'enum' defined for the parameter
          singleton:
            type: string
            description: the one and only 'enum' defined for the parameter (if there is only one)
          isBodyParameter:
            type: boolean
          isPathParameter:
            type: boolean
          isQueryParameter:
            type: boolean
          isPatternType:
            type: boolean
            description: true if *in* is 'query', and 'pattern' is defined
          isHeaderParameter:
            type: boolean
          isFormParameter:
            type: boolean
```

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

### x-swagger-js-method-name
By default, javascript method names are generated by concatenating the HTTP method name and path segments.
Generally, the generated names read well, but sometimes they turn out wrong:

```javascript
// A PUT to this path in a swagger schema:  /records/{id}/meta
// is intended to update a "meta" property on a specific "Record" entity.
// ...swagger-js-codegen generates a method named:
MyApi.prototype.putEntitiesByIdMeta = function(parameters) {
```

If you would like to provide your own method names, use the `x-swagger-js-method-name` field at the method level

```yaml
  /records/{id}/meta:
    put:
      x-swagger-js-method-name: updateRecordMetaData
      parameters:
      - name: id
       in: path
       ...
```

### x-proxy-header
Some proxies and application servers inject HTTP headers into the requests.  Server-side code
may use these fields, but they are not required in the client API.

eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers

```yaml
  /locations:
    get:
      parameters:
      - name: X-AppEngine-Country
        in: header
        x-proxy-header: true
        type: string
        description: Provided by AppEngine eg - US, AU, GB
      - name: country
        in: query
        type: string
        description: |
          2 character country code.
          If not specified, will default to the country provided in the X-AppEngine-Country header
      ...
```


## Grunt & Gulp task
[There is a grunt task](https://github.com/wcandillon/grunt-swagger-js-codegen) that enables you to integrate the code generation in your development pipeline. This is extremely convenient if your application is using APIs which are documented/specified in the swagger format.

And example of gulp task is available [here](https://github.com/28msec/cellstore/blob/master/tasks/swagger.js).

##Who is using it?
The [CellStore](https://github.com/28msec/cellstore) project.

[28.io](http://28.io) is using this project to generate their [nodejs](https://github.com/28msec/28.io-nodejs) and [angularjs language bindings](https://github.com/28msec/28.io-angularjs).
