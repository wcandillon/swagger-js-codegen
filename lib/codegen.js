'use strict';

const fs = require('fs');
const Mustache = require('mustache');
const beautify = require('js-beautify').js_beautify;
const lint = require('jshint').JSHINT;
const _ = require('lodash');
const ts = require('./typescript.js');
const flow = require('./flow.js');
const normalizeName = id => id.replace(/\.|\-|\{|\}|\s/g, '_');

const getPathToMethodName = (opts, m, path) => {
    if(path === '/' || path === '') {
        return m;
    }

    // clean url path for requests ending with '/'
    const cleanPath = path.replace(/\/$/, '');

    let segments = cleanPath.split('/').slice(1);
    segments = _.transform(segments, (result, segment) => {
        if (segment[0] === '{' && segment[segment.length - 1] === '}') {
            segment = `by${segment[1].toUpperCase()}${segment.substring(2, segment.length - 1)}`;
        }
        result.push(segment);
    });
    const result = _.camelCase(segments.join('-'));
    return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

const getViewForSwagger2 = (opts, type) => {
    const swagger = opts.swagger;
    const methods = [];
    const authorizedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'COPY', 'HEAD', 'OPTIONS', 'LINK', 'UNLIK', 'PURGE', 'LOCK', 'UNLOCK', 'PROPFIND'];
    const data = {
        isNode: type === 'node' || type === 'react',
        isES6: opts.isES6 || type === 'react',
        description: swagger.info.description,
        isSecure: swagger.securityDefinitions !== undefined,
        moduleName: opts.moduleName,
        className: opts.className,
        imports: opts.imports,
        domain: (swagger.schemes && swagger.schemes.length > 0 && swagger.host && swagger.basePath) ? `${swagger.schemes[0]}://${swagger.host}${swagger.basePath.replace(/\/+$/g,'')}` : '',
        methods: [],
        definitions: []
    };


    for (const [path, api] of Object.entries(swagger.paths)) {
        let globalParams = [];
        
        for (const [m, op] of Object.entries(api)) {
            if(m.toLowerCase() === 'parameters') {
                globalParams = op;
            }
        }
        
        for (const [m, op] of Object.entries(api)) {
            const M = m.toUpperCase();
            if(M === '' || !authorizedMethods.includes(M)) {
                continue;
            }
            const secureTypes = [];
            if(swagger.securityDefinitions !== undefined || op.security !== undefined) {
							  const mergedSecurity = _.merge([], swagger.security, op.security).map(security => Object.keys(security));
							  if(swagger.securityDefinitions) {
									for(const sk in swagger.securityDefinitions) {
                    if(mergedSecurity.join(',').includes(sk)){
											secureTypes.push(swagger.securityDefinitions[sk].type);
                    }
									}
                }
            }
            let methodName = (op.operationId ? normalizeName(op.operationId) : getPathToMethodName(opts, m, path));
            // Make sure the method name is unique
            if(methods.includes(methodName)) {
              let i = 1;
              while(true) {
                if(methods.includes(`${methodName}_${i}`)) {
                  i++;
                } else {
                  methodName = `${methodName}_${i}`;
                  break;
                }
              }
            }
            methods.push(methodName);

            const method = {
                path,
                className: opts.className,
                methodName,
                method: M,
                isGET: M === 'GET',
                isPOST: M === 'POST',
                summary: op.description || op.summary,
                externalDocs: op.externalDocs,
                isSecure: swagger.security !== undefined || op.security !== undefined,
							  isSecureToken: secureTypes.includes('oauth2'),
							  isSecureApiKey: secureTypes.includes('apiKey'),
							  isSecureBasic: secureTypes.includes('basic'),
                parameters: [],
                hasParameters: false,
                headers: []
            };
					  if(method.isSecure && method.isSecureToken) {
					      data.isSecureToken = method.isSecureToken;
					  }
					  if(method.isSecure && method.isSecureApiKey) {
						    data.isSecureApiKey = method.isSecureApiKey;
					  }
					  if(method.isSecure && method.isSecureBasic) {
						    data.isSecureBasic = method.isSecureBasic;
					  }
					  const produces = op.produces || swagger.produces;
            if(produces) {
                method.headers.push({
                  name: 'Accept',
                  value: `'${produces.map(value => value).join(', ')}'`,
                });
            }

            const consumes = op.consumes || swagger.consumes;
            if(consumes) {
                method.headers.push({name: 'Content-Type', value: `'${consumes}'` });
            }

            let params = Array.isArray(op.parameters) ? op.parameters : [];
            params = params.concat(globalParams);
            _.forEach(params, parameter => {
                //Ignore parameters which contain the x-exclude-from-bindings extension
                if(parameter['x-exclude-from-bindings'] === true) {
                    return;
                }

                // Ignore headers which are injected by proxies & app servers
                // eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers
                if (parameter['x-proxy-header'] && !data.isNode) {
                    return;
                }
                if (typeof parameter.$ref === 'string') {
                    const segments = parameter.$ref.split('/');
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
                parameter.flowType = flow.convertType(parameter);
                parameter.cardinality = parameter.required ? '' : '?';
                method.parameters.push(parameter);
            });

            method.isInlineType = false;
            _.forEach(op.responses, ({schema, description}, key) => {
                if (key.startsWith('2')) {
                    if (schema) {
                        method.methodTsType = ts.convertType(schema);
                        method.methodFlowType = flow.convertType(schema);
                        method.isInlineType = true;
                    } else {
                        method.methodResponse = description;
                    }
                }
            });
            method.hasParameters = method.parameters.length > 0;
            data.methods.push(method);
        }
    }

    _.forEach(swagger.definitions, (definition, name) => {
        data.definitions.push({
            name: type === 'flow' ? flow.sanitizeReservedWords(name) : name,
            description: definition.description,
            flowType: flow.convertType(definition, swagger),
            tsType: ts.convertType(definition, swagger)
        });
    });

    return data;
};

const getViewForSwagger1 = (opts, type) => {
    const swagger = opts.swagger;
    const data = {
        isNode: type === 'node' || type === 'react',
        isES6: opts.isES6 || type === 'react',
        description: swagger.description,
        moduleName: opts.moduleName,
        className: opts.className,
        domain: swagger.basePath ? swagger.basePath : '',
        methods: []
    };
    swagger.apis.forEach(({operations, path}) => {
        operations.forEach(op => {
            if (op.method === 'OPTIONS') {
                return;
            }
            const method = {
                path: path,
                className: opts.className,
                methodName: op.nickname,
                method: op.method,
                isGET: op.method === 'GET',
                isPOST: op.method.toUpperCase() === 'POST',
                summary: op.summary,
                parameters: op.parameters,
                headers: []
            };

            if(op.produces) {
                const headers = [];
                headers.value = [];
                headers.name = 'Accept';
                headers.value.push(op.produces.map(value => `'${value}'`).join(', '));
                method.headers.push(headers);
            }

            op.parameters = op.parameters ? op.parameters : [];
            op.parameters.forEach(parameter => {
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

const getCode = (opts, type) => {
    // For Swagger Specification version 2.0 value of field 'swagger' must be a string '2.0'
    const data = opts.swagger.swagger === '2.0' ? getViewForSwagger2(opts, type) : getViewForSwagger1(opts, type);
    if (type === 'custom') {
        if (!_.isObject(opts.template) || !_.isString(opts.template.class)  || !_.isString(opts.template.method)) {
            throw new Error('Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }');
        }
    } else {
        if (!_.isObject(opts.template)) {
            opts.template = {};
        }
        const templates = `${__dirname}/../templates/`;
        opts.template.class = opts.template.class || fs.readFileSync(`${templates + type}-class.mustache`, 'utf-8');
        opts.template.method = opts.template.method || fs.readFileSync(`${templates + (_.includes(['flow', 'typescript'], type) ? `${type}-` : '')}method.mustache`, 'utf-8');
        if(type === 'typescript') {
            opts.template.type = opts.template.type || fs.readFileSync(`${templates}type.mustache`, 'utf-8');
        } else if (type === 'flow') {
          opts.template.type = opts.template.type || fs.readFileSync(`${templates}flow-type.mustache`, 'utf-8');
        }
    }

    if (opts.mustache) {
        _.assign(data, opts.mustache);
    }

    const source = Mustache.render(opts.template.class, data, opts.template);
    const lintOptions = {
        node: type === 'node' || type === 'custom',
        browser: type === 'angular' || type === 'custom' || type === 'react',
        undef: true,
        strict: true,
        trailing: true,
        smarttabs: true,
        maxerr: 999
    };
    if (opts.esnext) {
        lintOptions.esnext = true;
    }

    if(type === 'typescript' || type === 'flow') {
        opts.lint = false;
    }

    if (opts.lint === undefined || opts.lint === true) {
        lint(source, lintOptions);
        lint.errors.forEach(({code, reason, evidence}) => {
            if (code[0] === 'E') {
                throw new Error(`${reason} in ${evidence} (${code})`);
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
    getAngularCode(opts) {
        return getCode(opts, 'angular');
    },
    getNodeCode(opts) {
        return getCode(opts, 'node');
    },
    getReactCode(opts) {
        return getCode(opts, 'react');
    },
    getFlowCode(opts) {
      return getCode(opts, 'flow');
    },
    getCustomCode(opts) {
        return getCode(opts, 'custom');
    }
};
