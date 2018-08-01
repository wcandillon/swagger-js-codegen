const generateFromSwaggerJson = require('../lib/codegen')
  .generateFromSwaggerJson;
const basicV3Schema = require('./schemas/v3-basic.json');
const basicV2Schema = require('./schemas/v2-basic.json');

test('Generates TYPESCRIPT class from Open Api 3.0 spec', () => {
  const result = generateFromSwaggerJson(basicV3Schema, {
    type: 'typescript',
    class: 'Api',
    tags: '*',
  });
  expect(result).toMatchSnapshot();
});

test('Generates JAVASCRIPT class from Open Api 3.0 spec', () => {
  const result = generateFromSwaggerJson(basicV3Schema, {
    type: 'javascript',
    class: 'Api',
    tags: '*',
  });
  expect(result).toMatchSnapshot();
});

test('Generates TYPESCRIPT class from Swagger 2 spec', () => {
  const result = generateFromSwaggerJson(basicV2Schema, {
    type: 'typescript',
    class: 'Api',
    tags: '*',
  });
  expect(result).toMatchSnapshot();
});

test('Generates JAVASCRIPT class from Swagger 2 spec', () => {
  const result = generateFromSwaggerJson(basicV2Schema, {
    type: 'javascript',
    class: 'Api',
    tags: '*',
  });
  expect(result).toMatchSnapshot();
});
