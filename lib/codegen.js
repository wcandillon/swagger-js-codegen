'use strict';

var fs = require('fs');
var Mustache = require('mustache');
var prettier = require('prettier');
var _ = require('lodash');
var getViewForSwagger2 = require('./views/swagger2').getViewForSwagger2;
var getViewForSwagger3 = require('./views/swagger3').getViewForSwagger3;
const utilities = require('./utilities').Utilities;

var generateFromSwaggerJson = function (swaggerJson, opts) {
  const version = utilities.getVersion(swaggerJson);
  if (![2, 3].includes(version)) {
    throw new Error('Only Swagger versions 2 or 3 are supported!');
  }

  const swagger = utilities.filterSwaggerPathsByTags(swaggerJson, opts.tags);

  return getCode(
    Object.assign({}, opts, { className: opts.class, swagger: swagger }),
    version,
  );
};

var getCode = function (opts, version) {
  const type = opts.type;
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
      fs.readFileSync(
        `${templates}${type}-v${version}-class.mustache`,
        'utf-8',
      );
    opts.template.method =
      opts.template.method ||
      fs.readFileSync(
        `${templates}${type}-v${version}-method.mustache`,
        'utf-8',
      );
    if (type === 'typescript') {
      opts.template.type =
        opts.template.type ||
        fs.readFileSync(`${templates}type.mustache`, 'utf-8');
    }
  }

  if (opts.mustache) {
    _.assign(data, opts.mustache);
  }

  var source = Mustache.render(opts.template.class, data, opts.template);

  return prettier.format(source, {
    parser: type === 'typescript' ? 'typescript' : 'babel',
    singleQuote: true,
    trailingComma: 'all',
  });
};

exports.getCode = getCode;
exports.generateFromSwaggerJson = generateFromSwaggerJson;
