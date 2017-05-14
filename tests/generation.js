'use strict';

var assert = require('assert');
var vows = require('vows');
var fs = require('fs');
var ffs = require('final-fs');
var ts = require('typescript');
var tmp = require('tmp');

var CodeGen = require('../lib/codegen').CodeGen;

function compileString(testName, input) {
    var tmpDir = tmp.dirSync({
        dir: './',
        unsafeCleanup: true,
        keep: true
    });
    var tmpFile = tmp.fileSync({
        postfix: '.ts',
        dir: tmpDir.name,
        keep: true
    });
    fs.writeFileSync(tmpFile.fd, input);

    var program = ts.createProgram([tmpFile.name], {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2016, // Makes promises resolve
        moduleResolution: ts.ModuleResolutionKind.NodeJs // ensure we can use node_modules
    });
    var emitResult = program.emit();

    var allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(function(diagnostic) {
        var lineAndCharacter = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        var line = lineAndCharacter.line;
        var character = lineAndCharacter.character;
        var message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        var outputLine = diagnostic.file.text.split('\n')[line];
        console.log('\n' + testName + ': (' + (line + 1) + ',' + (character + 1) + '): ' + message);
        console.log('     ERROR line: ' + outputLine.trim());
    });

    var errorsSeen = allDiagnostics.length !== 0;
    if (errorsSeen) {
        console.log('     ERRORS seen, generated code preserved in: ' + tmpFile.name);
    } else {
        tmpFile.removeCallback();
        tmpDir.removeCallback();
    }
    return !errorsSeen;
}

var batch = {};
var list = ffs.readdirSync('tests/apis');
list.forEach(function(file){
    file = 'tests/apis/' + file;
    batch[file] = function(){
        var swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
        var result = CodeGen.getNodeCode({
            className: 'Test',
            swagger: swagger
        });
        assert(typeof(result), 'string');
        result = CodeGen.getReactCode({
		moduleName: 'Test',
		className: 'Test',
	    	swagger: swagger
	  	});
  	assert(typeof(result), 'string');
        result = CodeGen.getAngularCode({
            moduleName: 'Test',
            className: 'Test',
            swagger: swagger
        });
        assert(typeof(result), 'string');
        result = CodeGen.getAngularCode({
            moduleName: 'Test',
            className: 'Test',
            swagger: swagger,
            lint: false,
            beautify: false
        });
        assert(typeof(result), 'string');
        assert(typeof(result), 'string');
        if(swagger.swagger === '2.0') {
            result = CodeGen.getTypescriptCode({
                moduleName: 'Test',
                className: 'Test',
                swagger: swagger,
                lint: false
            });
            assert(compileString('typescript generation: ' + file, result), 'typescript compilation failed');
            assert(typeof(result), 'string');
        }
        result = CodeGen.getCustomCode({
            moduleName: 'Test',
            className: 'Test',
            swagger: swagger,
            template: {
                class: fs.readFileSync(__dirname + '/../templates/angular-class.mustache', 'utf-8'),
                method: fs.readFileSync(__dirname + '/../templates/method.mustache', 'utf-8')
            }
        });
        assert(typeof(result), 'string');
    };
});
vows.describe('Test Generation').addBatch(batch).export(module);
