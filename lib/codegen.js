exports.CodeGen = function(className, swagger){
    'use strict';
    
    var beautify = require('js-beautify').js_beautify;
    var lint = require('jshint').JSHINT;

    var keywordMap = {
        'default': 'difault'
    };

    var camelCase = function(id){
        var tokens = [];
        id = keywordMap[id] ? keywordMap[id] : id;
        id.split('-').forEach(function(token, index){
            if(index === 0) {
                tokens.push(token[0].toLowerCase() + token.substring(1));
            } else {
                tokens.push(token[0].toUpperCase() + token.substring(1));
            }
        });
        return tokens.join('');
    };

    var addMethod = function(path, op){
        var params = 'var body; var path = \'' + path + '\';\nvar qs = {};\nvar headers = {};';
        op.parameters = op.parameters ? op.parameters : [];
        op.parameters.forEach(function(parameter){
            var name = camelCase(parameter.name);
            if(parameter.required === true) {
                params += 'if(parameters.' + name + ' === undefined){ deferred.reject(\'Missing required ' + parameter.paramType + ' parameter: ' + name + '\'); }';
            }
            if(parameter.paramType === 'body') {
                params += '\nbody = parameters.' + name + ';';
            } else if (parameter.paramType === 'path') {
                params += '\npath = path.replace(\'{' + parameter.name + '}\', parameters.' + name + ');';
            } else if(parameter.paramType === 'query') {
                params += '\nqs.' + name + ' = parameters.' + name + ';';
            } else if(parameter.paramType === 'header') {
                params += '\nheaders[\'' + parameter.name + '\'] = parameters.' + name + '; ';
            }
        });
        return '\n\nthis.' + op.nickname + ' = function(parameters){\n' +
        'var deferred = Q.defer();' +
        params +
        'request({ method: \'' + op.method + '\', uri: domain + path, qs: qs, headers: headers, body: body },' +
        ' function(error, response, body){' +
        'if(error) { deferred.reject(error); } else {' +
        '  if(/^application\\/(.*\\+)?json/.test(response.headers[\'content-type\'])) {' +
               'try { body = JSON.parse(body); } catch(e) { }' +
           '}' +
        '  if(response.statusCode >= 200 && response.statusCode <= 299) {' +
               'deferred.resolve({ response: response, body: body });' +
           '} else {' +
               'deferred.reject({ response: response, body: body });' +
           '}' +
        '}' +
        '});' +
        'return deferred.promise;' +
        '};';
    };

    var addClass = function(source){
        return 'module.exports.' + className + ' = function(domain) {\n\'use strict\';\n\nvar request = require(\'request\');\nvar Q = require(\'q\');' + source + '\n};';
    };

    this.getCode = function(){
        var source = '';
        swagger.apis.forEach(function(api){
            api.operations.forEach(function(operation){
                source += addMethod(api.path, operation);
            });
        });
        source = addClass(source);
        lint(source, {});
        lint.errors.forEach(function(error){
            if(error.code[0] === 'E') {
                throw new Error(lint.errors[0].reason + ' in ' + lint.errors[0].evidence);
            }
        });
        return beautify(source, { indent_size: 4 });
    };
};
