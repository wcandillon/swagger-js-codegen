const fs = require('fs');
const { program } = require('commander');
const generateFromSwaggerJson = require('./codegen').generateFromSwaggerJson;
const fetch = require('isomorphic-fetch');

program
  .command('generate <url|file>')
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
  .action(function (swaggerUrlOrFile, options) {
    let isFile = false;
    try {
      fs.lstatSync(swaggerUrlOrFile);
      isFile = fs.lstatSync(swaggerUrlOrFile).isFile();
    } catch (e) {
      isFile = false;
    }
    if (isFile) {
      // reading from file
      const swaggerJson = fs.readFileSync(swaggerUrlOrFile).toString();
      try {
        const results = generateFromSwaggerJson(
          JSON.parse(swaggerJson),
          options,
        );
        process.stdout.write(results); // output to stdout
      } catch (e) {
        process.stderr.write(e.toString() + '\n');
        process.exit(1);
      }
    } else {
      // reading from url
      fetch(swaggerUrlOrFile)
        .then((response) => {
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
        .then((swaggerJson) => {
          const results = generateFromSwaggerJson(swaggerJson, options);
          process.stdout.write(results); // output to stdout
        })
        .catch((e) => {
          process.stderr.write(e.toString() + '\n');
          process.exit(1);
        });
    }
  });

program.parse(process.argv);

exports.generateFromSwaggerJson = generateFromSwaggerJson;
