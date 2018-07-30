function matchRuleShort(rule, str) {
  return new RegExp('^' + rule.split('*').join('.*') + '$').test(str);
}

function filterTagsF(rule, str) {
  if (Array.isArray(rule)) {
    return rule.some(rulePart => {
      return matchRuleShort(rulePart, str);
    });
  }
  return matchRuleShort(rule, str);
}

function getVersion(swaggerDefinition) {
  if (swaggerDefinition.swagger === '2.0') {
    return 2;
  }
  if (
    swaggerDefinition.openapi &&
    typeof swaggerDefinition.openapi === 'string'
  ) {
    if (swaggerDefinition.openapi.match(/3.\d+.\d+/) !== null) {
      return 3;
    }
  }
  return null;
}

function filterSwaggerPathsByTags(swagger, tagsToFilter) {
  const operationIds = Object.keys(swagger.paths)
    .reduce((opids, path) => {
      const filteredOpIds = Object.keys(swagger.paths[path])
        .map(method => {
          let tags = swagger.paths[path][method].tags;
          if (!tags) {
            tags = ['default'];
          }
          if (tags.some(filterTagsF.bind(this, tagsToFilter.split(',')))) {
            return swagger.paths[path][method].operationId;
          }
          return null;
        })
        .filter(a => a);

      return [...opids, ...filteredOpIds];
    }, [])
    .filter(a => a);

  const newPaths = Object.keys(swagger.paths).reduce((finalPaths, path) => {
    const filteredDef = Object.keys(swagger.paths[path]).reduce((r, method) => {
      const x = swagger.paths[path][method];
      if (!x.operationId || operationIds.includes(x.operationId)) {
        return Object.assign(r, { [method]: x });
      }
      return r;
    }, {});

    if (
      !filteredDef.get &&
      !filteredDef.post &&
      !filteredDef.put &&
      !filteredDef.delete &&
      !filteredDef.patch
    ) {
      return finalPaths;
    }

    return Object.assign(finalPaths, { [path]: filteredDef });
  }, {});

  return Object.assign({}, swagger, {
    paths: newPaths,
  });
}

var normalizeName = function(id) {
  return id.replace(/\.|\-|\{|\}|\s/g, '_');
};

var getPathToMethodName = function(opts, m, path) {
  if (path === '/' || path === '') {
    return m;
  }

  // clean url path for requests ending with '/'
  var cleanPath = path.replace(/\/$/, '');

  var segments = cleanPath.split('/').slice(1);
  segments = _.transform(segments, function(result, segment) {
    if (segment[0] === '{' && segment[segment.length - 1] === '}') {
      segment =
        'by' +
        segment[1].toUpperCase() +
        segment.substring(2, segment.length - 1);
    }
    result.push(segment);
  });
  var result = _.camelCase(segments.join('-'));
  return m.toLowerCase() + result[0].toUpperCase() + result.substring(1);
};

exports.Utilities = {
  getVersion,
  filterSwaggerPathsByTags,
  normalizeName,
  getPathToMethodName,
};
