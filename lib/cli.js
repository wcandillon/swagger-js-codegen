'use strict';

const fs = require('fs');
const pkg = require('../package.json');
const cli = require('commander');
const yaml = require('js-yaml').safeLoad;
const CodeGen = require('./codegen').CodeGen;
const fetch = require('isomorphic-fetch');
const utilities = require('./utilities');

cli
  .version(pkg.version)
  .command('generate <url>')
  .alias('gen')
  .description('Generate from Swagger url')
  .option(
    '-t, --type <type>',
    'Code type [typescript]',
    /^(typescript|javascript)$/i,
    'typescript',
  )
  .option('--tags <items>', 'Tags to generate', '*')
  .option('-c, --class <class>', 'Class name [Api]', 'Api')
  .action(function(swaggerUrl, options) {
    const fnName =
      'get' +
      options.type.charAt(0).toUpperCase() +
      options.type.substr(1) +
      'Code';
    const fn = CodeGen[fnName];

    fetch(swaggerUrl)
      .then(response => response.json())
      .then(swaggerJson => {
        const swagger = utilities.filterSwaggerPathsByTags(
          swaggerJson,
          options.tags,
        );

        const result = fn({
          moduleName: options.module,
          className: options.class,
          swagger: swagger,
          lint: options.lint,
          beautify: options.beautify,
        });

        console.log(result);
      });
  });

cli.parse(process.argv);
