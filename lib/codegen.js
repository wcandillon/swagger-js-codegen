'use strict';

var fs = require('fs');
var Mustache = require('mustache');
var beautify = require('js-beautify').js_beautify;
var lint = require('jshint').JSHINT;
var _ = require('lodash');
var ts = require('./typescript');

var normalizeName = function(id) {
    return id.replace(/\.|\-|\{|\}/g, '_');
};

var getPathToMethodName = function(opts, m, path){
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
    var result = _.camelCase(segments.join('-'));
    return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

var getViewForSwagger2 = function(opts, type){
    var swagger = opts.swagger;
    var authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLIK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'];
    var data = {
        isNode: type === 'node',
        description: swagger.info.description,
        isSecure: swagger.securityDefinitions !== undefined,
        moduleName: opts.moduleName,
        className: opts.className,
        imports: opts.imports,
        domain: (swagger.schemes && swagger.schemes.length > 0 && swagger.host && swagger.basePath) ? swagger.schemes[0] + '://' + swagger.host + swagger.basePath.replace(/\/+$/g,'') : '',
        methods: []
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
                methodName:  op.operationId ? normalizeName(op.operationId) : getPathToMethodName(opts, m, path),
                method: m.toUpperCase(),
                isGET: m.toUpperCase() === 'GET',
                summary: op.description || op.summary,
                externalDocs: op.externalDocs,
                isSecure: swagger.security !== undefined || op.security !== undefined,
                parameters: [],
                headers: []
            };

            if(op.produces) {
                var headers = [];
                headers.value = [];

                headers.name = 'Accept';
                headers.value.push(op.produces.map(function(value) { return '\'' + value + '\''; }).join(', '));
                
                method.headers.push(headers);
            }
          
            var consumes = op.consumes || swagger.consumes;
            if(consumes) {
                method.headers.push({name: 'Content-Type', value: '\'' + consumes + '\'' });
            }

            var params = [];
            if(_.isArray(op.parameters)) {
                params = op.parameters;
            }
            params = params.concat(globalParams);
            _.forEach(params, function(parameter) {
                //Ignore parameters which contain the x-exclude-from-bindings extension
                if(parameter['x-exclude-from-bindings'] === true) {
                    return;
                }

                // Ignore headers which are injected by proxies & app servers
                // eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers
                if (parameter['x-proxy-header'] && !data.isNode) {
                    return;
                }
                if (_.isString(parameter.$ref)) {
                    var segments = parameter.$ref.split('/');
                    parameter = swagger.parameters[segments.length === 1 ? segments[0] : segments[2] ];
                }
                parameter.camelCaseName = _.camelCase(parameter.name);
                if(parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }
                if(parameter.in === 'body'){
                    parameter.isBodyParameter = true;
                } else if(parameter.in === 'path'){
                    parameter.isPathParameter = true;
                } else if(parameter.in === 'query'){
                    if(parameter['x-name-pattern']){
                        parameter.isPatternType = true;
                        parameter.pattern = parameter['x-name-pattern'];
                    }
                    parameter.isQueryParameter = true;
                } else if(parameter.in === 'header'){
                    parameter.isHeaderParameter = true;
                } else if(parameter.in === 'formData'){
                    parameter.isFormParameter = true;
                }
                parameter.tsType = ts.convertType(parameter);
                parameter.cardinality = parameter.required ? '' : '?';
                method.parameters.push(parameter);
            });
            data.methods.push(method);
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
                parameters: op.parameters,
                headers: []
            };

            if(op.produces) {
                var headers = [];
                headers.value = [];

                headers.name = 'Accept';
                headers.value.push(op.produces.map(function(value) { return '\'' + value + '\''; }).join(', '));
                
                method.headers.push(headers);
            }

            op.parameters = op.parameters ? op.parameters : [];
            op.parameters.forEach(function(parameter) {
                parameter.camelCaseName = _.camelCase(parameter.name);
                if(parameter.enum && parameter.enum.length === 1) {
                    parameter.isSingleton = true;
                    parameter.singleton = parameter.enum[0];
                }
                if(parameter.paramType === 'body'){
                    parameter.isBodyParameter = true;
                } else if(parameter.paramType === 'path'){
                    parameter.isPathParameter = true;
                } else if(parameter.paramType === 'query'){
                    if(parameter['x-name-pattern']){
                        parameter.isPatternType = true;
                        parameter.pattern = parameter['x-name-pattern'];
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
        if (!_.isObject(opts.template) || !_.isString(opts.template.class)  || !_.isString(opts.template.method)) {
            throw new Error('Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }');
        }
    } else {
        if (!_.isObject(opts.template)) {
            opts.template = {};
        }
        var templates = __dirname + '/../templates/';
        opts.template.class = opts.template.class || fs.readFileSync(templates + type + '-class.mustache', 'utf-8');
        opts.template.method = opts.template.method || fs.readFileSync(templates + (type === 'typescript' ? 'typescript-' : '') + 'method.mustache', 'utf-8');
        if(type === 'typescript') {
            opts.template.type = fs.readFileSync(templates + 'type.mustache', 'utf-8');
        }
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

    if(type === 'typescript') {
        opts.lint = false;
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
    getTypescriptCode: function(opts){
        if (opts.swagger.swagger !== '2.0') {
            throw 'Typescript is only supported for Swagger 2.0 specs.';
        }
        return getCode(opts, 'typescript');
    },
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
