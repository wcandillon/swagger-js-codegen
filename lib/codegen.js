'use strict';

var fs = require('fs');
var Mustache = require('mustache');
var prettier = require('prettier');
var _ = require('lodash');
var getViewForSwagger2 = require('./views/swagger2').getViewForSwagger2;
var getViewForSwagger3 = require('./views/swagger3').getViewForSwagger3;

var getCode = function(opts, type, version) {
  // For Swagger Specification version 2.0 value of field 'swagger' must be a string '2.0'
  let data = null;
  if (version === 2) {
    data = getViewForSwagger2(opts, type);
  } else if (version === 3) {
    data = getViewForSwagger3(opts, type);
  }
  if (type === 'custom') {
    if (
      !_.isObject(opts.template) ||
      !_.isString(opts.template.class) ||
      !_.isString(opts.template.method)
    ) {
      throw new Error(
        'Unprovided custom template. Please use the following template: template: { class: "...", method: "...", request: "..." }',
      );
    }
  } else {
    if (!_.isObject(opts.template)) {
      opts.template = {};
    }
    var templates = __dirname + '/../templates/';
    opts.template.class =
      opts.template.class ||
      fs.readFileSync(templates + type + '-class.mustache', 'utf-8');
    opts.template.method =
      opts.template.method ||
      fs.readFileSync(
        templates +
          (type === 'typescript' ? 'typescript-' : '') +
          'method.mustache',
        'utf-8',
      );
    if (type === 'typescript') {
      opts.template.type =
        opts.template.type ||
        fs.readFileSync(templates + 'type.mustache', 'utf-8');
    }
  }

  if (opts.mustache) {
    _.assign(data, opts.mustache);
  }

  var source = Mustache.render(opts.template.class, data, opts.template);

  return prettier.format(source, {
    parser: type === 'typescript' ? 'typescript' : 'babylon',
    singleQuote: true,
    trailingComma: 'all',
  });
};

exports.CodeGen = {
  getTypescriptCode: function(opts, version) {
    return getCode(opts, 'typescript', version);
  },
  getJavascriptCode: function(opts, version) {
    return getCode(opts, 'javascript', version);
  },
  getCustomCode: function(opts, version) {
    return getCode(opts, 'custom', version);
  },
};
