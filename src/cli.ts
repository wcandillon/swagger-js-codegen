import * as fs from 'fs';
import * as cli from 'commander';
import { CodeGen } from './codegen';

const pkg = require('../package.json');

cli
    .command('generate <file>')
    .description('Generate from Swagger file')
    .action((file: string) => {
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