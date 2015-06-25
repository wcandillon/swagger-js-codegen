var fs = require('fs');
var CodeGen = require('./lib/codegen').CodeGen;

var file = 'tests/apis/queries.json';
var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
var source = CodeGen.getTypeScriptDefinition({ className: 'Test', swagger: swagger });
console.log(source);