'use strict';

var assert = require('assert');
var vows = require('vows');
var fs = require('fs');
var ffs = require('final-fs');
var ts = require('typescript');
var tmp = require('tmp');

var CodeGen = require('../lib/codegen').CodeGen;

function compileString(testName, input) {
    const tmpDir = tmp.dirSync({
        dir: './',
        unsafeCleanup: true,
        keep: true
    });
    const tmpFile = tmp.fileSync({
        postfix: '.ts',
        dir: tmpDir.name,
        keep: true
    });
    fs.writeFileSync(tmpFile.fd, input);

    const program = ts.createProgram([tmpFile.name], {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2016, // Makes promises resolve
        moduleResolution: ts.ModuleResolutionKind.NodeJs // ensure we can use node_modules
    });
    const emitResult = program.emit();

    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

    allDiagnostics.forEach(({file, start, messageText}) => {
        const lineAndCharacter = file.getLineAndCharacterOfPosition(start);
        const line = lineAndCharacter.line;
        const character = lineAndCharacter.character;
        const message = ts.flattenDiagnosticMessageText(messageText, '\n');
        const outputLine = file.text.split('\n')[line];
        console.log(`\n${testName}: (${line + 1},${character + 1}): ${message}`);
        console.log(`     ERROR line: ${outputLine.trim()}`);
    });

    const errorsSeen = allDiagnostics.length !== 0;
    if (errorsSeen) {
        console.log('     ERRORS seen, generated code preserved in: ' + tmpFile.name);
    } else {
        tmpFile.removeCallback();
        tmpDir.removeCallback();
    }
    return !errorsSeen;
}

const batch = {};
const list = ffs.readdirSync('tests/apis');
list.forEach(file => {
    file = `tests/apis/${file}`;
    batch[file] = () => {
        const swagger = JSON.parse(fs.readFileSync(file, 'UTF-8'));
        let result = CodeGen.getNodeCode({
            className: 'Test',
            swagger
        });
        assert(typeof(result), 'string');
        result = CodeGen.getReactCode({
		moduleName: 'Test',
		className: 'Test',
	    	swagger
	  	});
  	assert(typeof(result), 'string');
        result = CodeGen.getAngularCode({
            moduleName: 'Test',
            className: 'Test',
            swagger
        });
        assert(typeof(result), 'string');
        result = CodeGen.getAngularCode({
            moduleName: 'Test',
            className: 'Test',
            swagger,
            lint: false,
            beautify: false
        });
        assert(typeof(result), 'string');
        assert(typeof(result), 'string');
        if(swagger.swagger === '2.0') {
            result = CodeGen.getTypescriptCode({
                moduleName: 'Test',
                className: 'Test',
                swagger,
                lint: false
            });
            assert(compileString('typescript generation: ' + file, result), 'typescript compilation failed');
            assert(typeof(result), 'string');
        }
        result = CodeGen.getCustomCode({
            moduleName: 'Test',
            className: 'Test',
            swagger,
            template: {
                class: fs.readFileSync(__dirname + '/../templates/angular-class.mustache', 'utf-8'),
                method: fs.readFileSync(__dirname + '/../templates/method.mustache', 'utf-8')
            }
        });
        assert(typeof(result), 'string');
    };
});
vows.describe('Test Generation').addBatch(batch).export(module);
