var fs = require('fs');
var CodeGen = require('./lib/codegen').CodeGen;

var file = '/Users/wcandillon/tmp/spec.json';
var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
var sourceCode = CodeGen.getJSONiqModule({ swagger: swagger });
console.log(sourceCode);
