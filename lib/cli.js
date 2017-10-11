'use strict';

const fs = require('fs');
const pkg = require('../package.json');
const cli = require('commander');
const yaml = require('js-yaml').safeLoad;
const CodeGen = require('./codegen').CodeGen;

cli
    .version(pkg.version)
    .command('generate <file> [imports...]')
    .alias('gen')
    .description('Generate from Swagger file')
    .option('-t, --type <type>', 'Code type [typescript]', /^(typescript|angular|node|react)$/i, 'typescript')
    .option('-m, --module <module>', 'Your AngularJS module name [Test]', 'Test')
    .option('-c, --class <class>', 'Class name [Test]', 'Test')
    .option('-l, --lint', 'Whether or not to run jslint on the generated code [false]')
    .option('-b, --beautify', 'Whether or not to beautify the generated code [false]')
    .action((file, imports, options) => {
        const fnName = 'get' + options.type.charAt(0).toUpperCase() + options.type.substr(1) + 'Code';
        const fn = CodeGen[fnName];
        options.lint = options.lint || false;
        options.beautify = options.beautify || false;

        const content = fs.readFileSync(file, 'utf-8');

        var swagger;
        try {
            swagger = JSON.parse(content);
        } catch (e) {
            swagger = yaml(content);
        }

        const result = fn({
            moduleName: options.module,
            className: options.class,
            swagger: swagger,
            lint: options.lint,
            beautify: options.beautify
        });

        console.log(result);
    });

cli.parse(process.argv);

if (!cli.args.length) {
    cli.help();
}
