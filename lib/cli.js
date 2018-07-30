const pkg = require('../package.json');
const cli = require('commander');
const CodeGen = require('./codegen').CodeGen;
const fetch = require('isomorphic-fetch');
const utilities = require('./utilities').Utilities;

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
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        try {
          const json = response.json();
          throw new Error(JSON.stringify(json));
        } catch (e) {
          throw new Error('Invalid Swaggger url');
        }
      })
      .then(swaggerJson => {
        const version = utilities.getVersion(swaggerJson);
        if (![2, 3].includes(version)) {
          throw 'Only Swagger versions 2 or 3 are supported!';
        }

        const swagger = utilities.filterSwaggerPathsByTags(
          swaggerJson,
          options.tags,
        );

        const result = fn(
          {
            className: options.class,
            swagger: swagger,
          },
          version,
        );

        console.log(result);
      })
      .catch(e => {
        console.error(e);
      });
  });

cli.parse(process.argv);
