'use strict';

const path = require('path');
const fs = require('fs');
const pkg = require('../package');
const cli = require('commander');
const writeFileAtomic = require('write-file-atomic');
const pathType = require('path-type');
const { CodeGen } = require('./codegen');
const { safeLoad } = require('js-yaml');

cli
    .version(pkg.version)
    .command('generate <name> <file> [output]')
    .option('-t --type <type>', 'Code Type', /^(typescript|angular|node|react)$/i, 'typescript')
    .description('Generate from Swagger file')
    .action((file, name, output, { type }) => {
        let swagger = '';
        try {
            swagger = JSON.parse(fs.readFileSync(file, 'utf-8'));
        } catch(e) {
            swagger = safeLoad(fs.readFileSync(file, 'utf8'));
        }

        const opts = {
            moduleName: name,
            className: name,
            swagger,
            lint: false
        };
        
        let result = '';
        
        if (type === 'angular') {
            result = CodeGen.getAngularCode(opts);
        }
        if (type === 'node') {
            result = CodeGen.getNodeCode(opts);
        }
        if (type === 'react') {
            result = CodeGen.getReactCode(opts);
        }
        if (type === 'typescript') {
            result = CodeGen.getTypescriptCode(opts);
        }
        
        if (output) {
            const isFile = pathType.file(output);
            
            // If output is a dir give it a name
            if (!isFile) {
                path.join(output, 'swagger');
            }

            // If missing extension give it one
            if (!['js', 'ts'].includes(output.split('.').pop())) {
                if (['angular', 'node', 'react'].includes(type)) {
                    return output + '.js';
                }
                if (type === 'typescript') {
                    return output + '.ts';
                }
            }

            return writeFileAtomic(output, result, {}, err => {
              if (err) {
                  throw err;
              }
              console.log(`Saved swagger code to ${output}`);
            });
        }

        console.log(result);
    });

cli.parse(process.argv);

if (!cli.args.length) {
    cli.help();
}