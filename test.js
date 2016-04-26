var fs = require('fs');
var CodeGen = require('./lib/codegen.js').CodeGen;

var uberAPISwagger = JSON.parse(fs.readFileSync('./tests/apis/uber.json'));

var opts = { swagger:uberAPISwagger, template: {} };

// var templateDirecotry = './templates/';

opts.template.class = fs.readFileSync('./templates/typescript-class-with-definitions.mustache', 'utf-8');
opts.template.method = fs.readFileSync('./templates/typescript-method-typed.mustache', 'utf-8');
opts.template.request = fs.readFileSync('./templates/typescript-request-typed.mustache', 'utf-8');

var result = CodeGen.getTypescriptCode(opts);
console.log(result);