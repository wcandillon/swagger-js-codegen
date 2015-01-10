#!/usr/bin/env node

var fs = require('fs'),
  esprima = require('esprima'),
  estraverse = require('estraverse'),
  doctrine = require('doctrine');

var swaggerModels = {};
var swProperties = {};

/**
 * Create Swagger attributes
 * @param {String} name       name of the attribute
 * @return {SwModel} object to store a swagger model
 */
function SWModel(name) {
  var swModel = {
    id: name,
    properties: {}
  };

  return swModel;
};

/**
 * create a swagger property
 * @param {String} name        name of the attribute
 * @param {String} type        of the attribute .e.g integer | number | etc.
 * @param {String} description desrciption of the field
 * @return {SWProperty} swagger property
 */
function SWProperty(name, type, description) {
  swProperty = {
    type: type,
    description: description
  };
  if (type === 'number')
    swProperty.format = 'number';
  if (type === 'integer')
    swProperty.format = 'int64';

  return swProperty;
}

/**
 * Parser code and extra swagger model definition
 * @param  {[type]} node [description]
 * @return {[type]}      [description]
 */
function swaggerModelParser(node) {
  var comment, data, params, missing;
  var swaggerModel;

  comment = node.leadingComments[0];

  if (comment.type !== 'Block') {
    return;
  }

  data = doctrine.parse(comment.value, {
    unwrap: true
  });

  params = [];
  data.tags.forEach(function(tag) {
    if (tag.title === 'swagger') {
      swaggerModel = SWModel(node.id.name);

    }
  });

  if (swaggerModel !== null) {
    swaggerModels[node.id.name] = swaggerModel;
    node.body.body.forEach(function(item) {
      if (item.type === 'ExpressionStatement') {
        var name = item.expression.left.property.name;

        // console.log(item.leadingComments[0]);
        var data = doctrine.parse(item.leadingComments[0].value, {
          unwrap: true
        });
        data.tags.forEach(function(tag) {
          if (tag.title === 'type') {
            swaggerModel.properties[name] = SWProperty(name, tag.type.name, data.description);
          }
        });

      }
    });
    console.log(JSON.stringify(swaggerModels, null, 4));
  }

}

function analyze_old(node) {
  var comment, data, params, missing;
  console.log(node);
  comment = node.leadingComments[0];
  if (comment.type !== 'Block') {
    return;
  }
  data = doctrine.parse(comment.value, {
    unwrap: true
  });

  params = [];
  data.tags.forEach(function(tag) {
    if (tag.title === 'param') {
      params.push(tag.name);
    }
  });

  missing = [];
  node.params.forEach(function(param) {
    if (params.indexOf(param.name) < 0) {
      missing.push(param.name);
    }
  });
  if (missing.length > 0) {
    console.error('In function', node.id.name, '(Line', node.loc.start.line + '):');
    missing.forEach(function(m) {
      console.error(' Parameter', m, 'is not documented.');
    });
    console.error();
  }
}

function verify(node) {
  switch (node.type) {
    case esprima.Syntax.FunctionDeclaration:
      if (node.leadingComments.length === 1) {
        swaggerModelParser(node);
      }
      break;
    default:
      break;
  }
}

function check(filename) {
  var content, tree;
  try {
    content = fs.readFileSync(filename, 'utf-8');
    tree = esprima.parse(content, {
      attachComment: true,
      loc: true
    });
    //console.log(JSON.stringify(tree, null, 4));
    estraverse.traverse(tree, {
      enter: verify
    });
  } catch (e) {
    console.error(e.toString());
    process.exit(1);
  }
}

if (process.argv.length === 2) {
  console.error('Usage: missing-doc.js filename');
  process.exit(1);
}
check(process.argv[2]);