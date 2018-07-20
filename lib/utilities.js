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

exports.filterSwaggerPathsByTags = filterSwaggerPathsByTags;
