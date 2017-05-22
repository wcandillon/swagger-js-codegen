'use strict';

const fs = require('fs');
const pkg = require('../package.json');
const cli = require('commander');
const CodeGen = require('./codegen').CodeGen;

cli
    .command('generate <file>')
    .description('Generate from Swagger file')
    .action(file => {
        const result = CodeGen.getTypescriptCode({
            moduleName: 'Test',
            className: 'Test',
            swagger: JSON.parse(fs.readFileSync(file, 'utf-8')),
            lint: false
        });
        console.log(result);
    });

cli.version(pkg.version);
cli.parse(process.argv);

if (!cli.args.length) {
    cli.help();
}