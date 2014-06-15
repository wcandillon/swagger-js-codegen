var fs = require("fs");

var CodeGen = require('./lib/codegen').CodeGen;

var swagger = fs.readFileSync('swagger/_queries', 'UTF-8');
var gen = new CodeGen('Queries', JSON.parse(swagger));
console.log(gen.getCode());