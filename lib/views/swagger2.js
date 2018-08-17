var _ = require('lodash');
var ts = require('../typescript');
var normalizeName = require('../utilities').Utilities.normalizeName;
var getPathToMethodName = require('../utilities').Utilities.getPathToMethodName;

var getViewForSwagger2 = function(opts, type) {
  var swagger = opts.swagger;
  var methods = [];
  var authorizedMethods = [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'COPY',
    'HEAD',
    'OPTIONS',
    'LINK',
    'UNLIK',
    'PURGE',
    'LOCK',
    'UNLOCK',
    'PROPFIND',
  ];
  var data = {
    isNode: type === 'node' || type === 'javascript',
    isES6: opts.isES6 || type === 'javascript',
    description: swagger.info.description,
    isSecure: swagger.securityDefinitions !== undefined,
    className: opts.className,
    domain:
      swagger.schemes &&
      swagger.schemes.length > 0 &&
      swagger.host &&
      swagger.basePath
        ? swagger.schemes[0] +
          '://' +
          swagger.host +
          swagger.basePath.replace(/\/+$/g, '')
        : '',
    methods: [],
    definitions: [],
  };

  _.forEach(swagger.paths, function(api, path) {
    var globalParams = [];
    /**
     * @param {Object} op - meta data for the request
     * @param {string} m - HTTP method name - eg: 'get', 'post', 'put', 'delete'
     */
    _.forEach(api, function(op, m) {
      if (m.toLowerCase() === 'parameters') {
        globalParams = op;
      }
    });
    _.forEach(api, function(op, m) {
      var M = m.toUpperCase();
      if (M === '' || authorizedMethods.indexOf(M) === -1) {
        return;
      }
      var secureTypes = [];
      if (
        swagger.securityDefinitions !== undefined ||
        op.security !== undefined
      ) {
        var mergedSecurity = _.merge([], swagger.security, op.security).map(
          function(security) {
            return Object.keys(security);
          },
        );
        if (swagger.securityDefinitions) {
          for (var sk in swagger.securityDefinitions) {
            if (mergedSecurity.join(',').indexOf(sk) !== -1) {
              secureTypes.push(swagger.securityDefinitions[sk].type);
            }
          }
        }
      }
      var methodName = op.operationId
        ? normalizeName(op.operationId)
        : getPathToMethodName(opts, m, path);
      // Make sure the method name is unique
      if (methods.indexOf(methodName) !== -1) {
        var i = 1;
        while (true) {
          if (methods.indexOf(methodName + '_' + i) !== -1) {
            i++;
          } else {
            methodName = methodName + '_' + i;
            break;
          }
        }
      }

      methods.push(methodName);

      var method = {
        path: path,
        className: opts.className,
        methodName: methodName,
        method: M,
        isGET: M === 'GET',
        isPOST: M === 'POST',
        summary: op.description || op.summary,
        externalDocs: op.externalDocs,
        isSecure: swagger.security !== undefined || op.security !== undefined,
        isSecureToken: secureTypes.indexOf('oauth2') !== -1,
        isSecureApiKey: secureTypes.indexOf('apiKey') !== -1,
        isSecureBasic: secureTypes.indexOf('basic') !== -1,
        parameters: [],
        headers: [],
      };
      if (method.isSecure && method.isSecureToken) {
        data.isSecureToken = method.isSecureToken;
      }
      if (method.isSecure && method.isSecureApiKey) {
        data.isSecureApiKey = method.isSecureApiKey;
      }
      if (method.isSecure && method.isSecureBasic) {
        data.isSecureBasic = method.isSecureBasic;
      }
      var produces = op.produces || swagger.produces;
      if (produces) {
        produces.forEach(contentType => {
          method.headers.push({
            name: 'Accept',
            value: contentType,
          });
        });
      }

      var consumes = op.consumes || swagger.consumes;
      if (consumes) {
        consumes.forEach(contentType => {
          method.headers.push({
            name: 'Content-Type',
            value: contentType,
          });
        });
      }

      var params = [];
      if (_.isArray(op.parameters)) {
        params = op.parameters;
      }
      params = params.concat(globalParams);
      var hasBody = false;
      var hasAnyRequired = false;
      _.forEach(params, function(parameter) {
        //Ignore parameters which contain the x-exclude-from-bindings extension
        if (parameter['x-exclude-from-bindings'] === true) {
          return;
        }

        // Ignore headers which are injected by proxies & app servers
        // eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers
        if (parameter['x-proxy-header'] && !data.isNode) {
          return;
        }
        if (_.isString(parameter.$ref)) {
          var segments = parameter.$ref.split('/');
          parameter =
            swagger.parameters[
              segments.length === 1 ? segments[0] : segments[2]
            ];
        }
        parameter.camelCaseName = _.camelCase(parameter.name);
        if (parameter.enum && parameter.enum.length === 1) {
          parameter.isSingleton = true;
          parameter.singleton = parameter.enum[0];
        }
        if (parameter.in === 'body') {
          hasBody = true;
          parameter.isBodyParameter = true;
        } else if (parameter.in === 'path') {
          parameter.isPathParameter = true;
        } else if (parameter.in === 'query') {
          if (parameter['x-name-pattern']) {
            parameter.isPatternType = true;
            parameter.pattern = parameter['x-name-pattern'];
          }
          parameter.isQueryParameter = true;
        } else if (parameter.in === 'header') {
          parameter.isHeaderParameter = true;
        } else if (parameter.in === 'formData') {
          parameter.isFormParameter = true;
        }
        parameter.tsType = ts.convertType(parameter, swagger);

        parameter.cardinality = parameter.required ? '' : '?';

        if (parameter.required && parameter.in !== 'path') {
          hasAnyRequired = true;
        }

        parameter.isDefaultQuoted = false;
        if (parameter.default && typeof parameter.default === 'string') {
          parameter.isDefaultQuoted = true;
        }

        method.parameters.push(parameter);
      });

      method.defaultParam = hasAnyRequired ? '' : ' = {}';

      method.hasBody = hasBody;
      method.responses = op.responses;
      method.successResponses = [];
      _.forEach(method.responses, (obj, statusCode) => {
        if (statusCode === '200' || statusCode === '201') {
          method.successResponses.push({
            tsType: ts.convertType(obj, swagger),
          });
        }
        method.responses[statusCode].tsType = ts.convertType(obj, swagger);
      });
      if (method.successResponses.length > 0) {
        method.successResponses[method.successResponses.length - 1].last = true;
      }
      data.methods.push(method);
    });
  });

  _.forEach(swagger.definitions, function(definition, name) {
    data.definitions.push({
      name: name,
      description: definition.description,
      tsType: ts.convertType(definition, swagger),
    });
  });

  return data;
};

exports.getViewForSwagger2 = getViewForSwagger2;
