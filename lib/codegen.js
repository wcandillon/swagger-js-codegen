'use strict';

var fs = require('fs');
var Mustache = require('mustache');
var beautify = require('js-beautify').js_beautify;
var lint = require('jshint').JSHINT;
var _ = require('lodash');

var camelCase = function(id) {
    if(id.indexOf('-') === -1) {
        return id;
    }
    var tokens = [];
    id.split('-').forEach(function(token, index){
        if(index === 0) {
            tokens.push(token[0].toLowerCase() + token.substring(1));
        } else {
            tokens.push(token[0].toUpperCase() + token.substring(1));
        }
    });
    return tokens.join('');
};

var normalizeName = function(id) {
    return id.replace(/\.|\-|\{|\}/g, '_');
};

var getPathToMethodName = function(m, path){
    if(path === '/' || path === '') {
        return m;
    }

    // clean url path for requests ending with '/'
    var cleanPath = path.replace(/\/$/, '');

    var segments = cleanPath.split('/').slice(1);
    segments = _.transform(segments, function (result, segment) {
        if (segment[0] === '{' && segment[segment.length - 1] === '}') {
            segment = 'by' + segment[1].toUpperCase() + segment.substring(2, segment.length - 1);
        }
        result.push(segment);
    });
    var result = camelCase(segments.join('-'));
    return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

var getViewForSwagger2 = function(opts, type){
    var swagger = opts.swagger;
    var authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLIK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'];
    var tempMainResourceHolder = [];
    var data = {
        isNode: type === 'node',
        description: swagger.info.description,
        isSecure: swagger.securityDefinitions !== undefined,
        moduleName: opts.moduleName,
        className: opts.className,
        domain: (swagger.schemes && swagger.schemes.length > 0 && swagger.host && swagger.basePath) ? swagger.schemes[0] + '://' + swagger.host + swagger.basePath : '',
        methods: [],
        mainResources: []
    };

    _.forEach(swagger.paths, function(api, path){
        var globalParams = [];
        /**
         * @param {Object} op - meta data for the request
         * @param {string} m - HTTP method name - eg: 'get', 'post', 'put', 'delete'
         */
        _.forEach(api, function(op, m){
            if(m.toLowerCase() === 'parameters') {
                globalParams = op;
            }
        });
        _.forEach(api, function(op, m){
            if(authorizedMethods.indexOf(m.toUpperCase()) === -1) {
                return;
            }
            var method = {
                path: path,
                className: opts.className,
                methodName: op['x-swagger-js-method-name'] ? op['x-swagger-js-method-name'] : (op.operationId ? normalizeName(op.operationId) : getPathToMethodName(m, path)),
                method: m.toUpperCase(),
                isGET: m.toUpperCase() === 'GET',
                summary: op.description,
                isSecure: swagger.security !== undefined || op.security !== undefined,
                parameters: [],
                responses: [],
                security: []
            };

            //Parse out path "main resource" (i.e. "users" if path is "/users/{id}" or "/users/edit")
            //TODO: Figure out how to deal with a request to root path (there is no 'main resource')
            var pathArr = method.path.split('/').filter(Boolean);
            var mainResourceName = (pathArr.length === 1 ? 'NO_RESOURCE' : (pathArr.length > 1 ? pathArr[1].toLowerCase() : null));

            if (mainResourceName === null) {
                console.log('Error: Main Resource "name" in path is null. Path: '+path);
            }

            if (tempMainResourceHolder && tempMainResourceHolder.indexOf(mainResourceName) === -1){
                var mainResource = { resourceName: mainResourceName, resourceMethods: [] };

                tempMainResourceHolder.push(mainResourceName);
                data.mainResources.push(mainResource);
            }

            //Add responses to method template variables
            if (op.responses) {

                _.forEach(op.responses, function(value, statusCode){
                    var responseObject = {};

                    responseObject = value;
                    responseObject.code = statusCode;
                    method.responses.push(responseObject);
                });
            }

            //Add security objects to method template variables
            if (op.security){
                var i;

                for (i = 0; i < op.security.length; i++){
                    var securityTypes = ['oauth2', 'apiKey', 'basic'];
                    var securityObject = {};
                    var securityKeys = _.keys(op.security[i]);
                    var name, securityDefinition;

                    if (securityKeys.length !== 1) {
                        console.log('Should only be one name in security object!');
                        continue;
                    }

                    name = securityKeys[0];
                    securityDefinition = swagger.securityDefinitions[name];

                    if (_.isNull(securityDefinition) || _.isUndefined(securityDefinition)) {
                        console.log('ERROR: Security definition for security object in operation NOT DEFINED in security definitions.');
                        continue;
                    }

                    if (_.indexOf(securityTypes, securityDefinition.type) === -1){
                        console.log('ERROR: Security definition with type "'+securityDefinition.type+'" is NOT allowed.');
                        continue;
                    }

                    if (securityDefinition.type !== 'oauth2' && op.security[i][name].length !== 0) {
                        console.log('ERROR: Security definition with type "'+securityDefinition.type+'" must have a value of an empty array (value is "'+op.security[i][name]+'").');
                        continue;
                    }

                    securityObject = swagger.securityDefinitions[name];
                    securityObject.name = name;
                    method.security.push(securityObject);
                }

                if (method.security.length > 0) {
                    method.security[method.security.length-1].last = true;
                }
            }

            var params = [];
            if(_.isArray(op.parameters)) {
                params = op.parameters;
            }
            params = params.concat(globalParams);
            _.forEach(params, function(parameter) {
                // Ignore headers which are injected by proxies & app servers
                // eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers
                if (parameter['x-proxy-header'] && !data.isNode) {
                    return;
                }
                if (_.isString(parameter.$ref)) {
                    var segments = parameter.$ref.split('/');
                    parameter = swagger.parameters[segments.length === 1 ? segments[0] : segments[2] ];
                }
                parameter.camelCaseName = camelCase(parameter.name);
                if(parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }

                //Do this to ensure that, if no description is included then the top-level description is not mistakenly used.
                //TODO: Probably should consider namespacing things so that these collisions are automatically avoided.
                if (_.isNull(parameter.description) || _.isUndefined(parameter.description)) {
                    parameter.description = null;
                }

                //Parse out body parameters
                if(parameter.in === 'body') {
                    method.hasBodyParameters = true;

                    if (parameter.schema) {

                        //Check for schema properties -> this will mean that body parameters are defined
                        if (parameter.schema.type && parameter.schema.type === 'object' && parameter.schema.properties) {
                            var bodyKeys;

                            parameter.hasBodyParameters = true;
                            parameter.bodyParams = [];
                            bodyKeys = _.keys(parameter.schema.properties);

                            _(parameter.schema.properties).forEach(function(param, key){
                                var obj = param;

                                //If body parameter has a type that is an array/object of types, parse them out into "typeIn"
                                if (obj.type && typeof(obj.type) !== 'string') {
                                    var i;

                                    obj.typeIn = [];
                                    for (i = 0; i < obj.type.length; i++) {
                                        obj.typeIn.push({name: obj.type[i], last: (i === obj.type.length-1 ? true : false)});
                                    }
                                }
                                obj.name = key;
                                parameter.bodyParams.push(obj);
                            });

                        } else {
                            parameter.hasSingularBodyParameter = true;
                            parameter.bodyParam = { type: parameter.schema.type };
                        }
                    }

                    parameter.isBodyParameter = true;
                } else if(parameter.in === 'path'){
                    method.hasPathParameters = true;
                    parameter.isPathParameter = true;

                    method.pathWithoutParams = path.replace('/{'+parameter.name+'}', '');
                    method.pathWithRegex = path.replace('{'+parameter.name+'}', '([a-zA-Z0-9]+)');

                } else if(parameter.in === 'query'){
                    method.hasQueryParameters = true;
                    if(parameter['x-name-pattern']){
                        parameter.isPatternType = true;
                    }
                    parameter.isQueryParameter = true;
                } else if(parameter.in === 'header'){
                    method.hasHeaderParameters = true;
                    parameter.isHeaderParameter = true;
                } else if(parameter.in === 'formData'){
                    method.hasFormDataParameters = true;
                    parameter.isFormParameter = true;
                }

                if (parameter.type && typeof(parameter.type) !== 'string') {
                    parameter.typeIn = [];

                    for (var i = 0; i < parameter.type.length; i++) {
                        parameter.typeIn.push({ name: parameter.type[i], last: (i === parameter.type.length-1 ? true : false) });
                    }
                }

                method.parameters.push(parameter);
            });
            data.methods.push(method);
            if (mainResourceName !== null) {
                data.mainResources[tempMainResourceHolder.indexOf(mainResourceName)].resourceMethods.push(method);
            }
        });
    });
    return data;
};

var getViewForSwagger1 = function(opts, type){
    var swagger = opts.swagger;
    var data = {
        isNode: type === 'node',
        description: swagger.description,
        moduleName: opts.moduleName,
        className: opts.className,
        domain: swagger.basePath ? swagger.basePath : '',
        methods: []
    };
    swagger.apis.forEach(function(api){
        api.operations.forEach(function(op){
            var method = {
                path: api.path,
                className: opts.className,
                methodName: op.nickname,
                method: op.method,
                isGET: op.method === 'GET',
                summary: op.summary,
                parameters: op.parameters
            };
            op.parameters = op.parameters ? op.parameters : [];
            op.parameters.forEach(function(parameter) {
                parameter.camelCaseName = camelCase(parameter.name);
                if(parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }
                if(parameter.paramType === 'body'){
                    parameter.isBodyParameter = true;
                } else if(parameter.paramType === 'path'){
                    parameter.isPathParameter = true;
                } else if(parameter.paramType === 'query'){
                    if(parameter.pattern){
                        parameter.isPatternType = true;
                    }
                    parameter.isQueryParameter = true;
                } else if(parameter.paramType === 'header'){
                    parameter.isHeaderParameter = true;
                } else if(parameter.paramType === 'form'){
                    parameter.isFormParameter = true;
                }
            });
            data.methods.push(method);
        });
    });
    return data;
};

var getCode = function(opts, type) {
    // For Swagger Specification version 2.0 value of field 'swagger' must be a string '2.0'
    var data = opts.swagger.swagger === '2.0' ? getViewForSwagger2(opts, type) : getViewForSwagger1(opts, type);
    if (type === 'custom') {
        if (!_.isObject(opts.template) || !_.isString(opts.template.class)  || !_.isString(opts.template.method) || !_.isString(opts.template.request)) {
            throw new Error('Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }');
        }
    } else {
        if (!_.isObject(opts.template)) {
            opts.template = {};
        }
        var templates = __dirname + '/../templates/';
        opts.template.class = opts.template.class || fs.readFileSync(templates + type + '-class.mustache', 'utf-8');
        opts.template.method = opts.template.method || fs.readFileSync(templates + 'method.mustache', 'utf-8');
        opts.template.request = opts.template.request || fs.readFileSync(templates + type + '-request.mustache', 'utf-8');
    }

    if (opts.mustache) {
        _.assign(data, opts.mustache);
    }

    var source = Mustache.render(opts.template.class, data, opts.template);
    var lintOptions = {
        node: type === 'node' || type === 'custom',
        browser: type === 'angular' || type === 'custom',
        undef: true,
        strict: true,
        trailing: true,
        smarttabs: true,
        maxerr: 999
    };
    if (opts.esnext) {
        lintOptions.esnext = true;
    }

    if (opts.lint === undefined || opts.lint === true) {
        lint(source, lintOptions);
        lint.errors.forEach(function(error) {
            if (error.code[0] === 'E') {
                throw new Error(error.reason + ' in ' + error.evidence + ' (' + error.code + ')');
            }
        });
    }
    if (opts.beautify === undefined || opts.beautify === true) {
        return beautify(source, { indent_size: 4, max_preserve_newlines: 2 });
    } else {
        return source;
    }
};

exports.CodeGen = {
    getAngularCode: function(opts){
        return getCode(opts, 'angular');
    },
    getNodeCode: function(opts){
        return getCode(opts, 'node');
    },
    getCustomCode: function(opts){
        return getCode(opts, 'custom');
    }
};
