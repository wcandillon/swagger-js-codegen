var fs = require('fs')
var path = require('path')
var _ = require('lodash')

var CodeGen = require('../lib/codegen').CodeGen;

var testCases = [
  {
    desc: 'Real world: protected',
    fixture: 'protected',
  },
  {
    desc: 'Real world: ref',
    fixture: 'ref',
  },
  {
    desc: 'Real world: test',
    fixture: 'test',
  },
  {
    desc: 'Real world: Uber',
    fixture: 'uber',
  },
  {
    desc: 'Real world: users',
    fixture: 'users',
  }
]

describe('TypeScript generation', function(){
  testCases.forEach(function(testCase) {
    it(testCase.desc, function() {
      var sourcePath = path.join(__dirname, 'fixtures', testCase.fixture, 'swagger.json')
      var swagger = JSON.parse(fs.readFileSync(sourcePath, 'UTF-8'));
      var expectedPath = path.join(__dirname, 'fixtures', testCase.fixture, 'expected.ts')

      var actual = CodeGen.getTypescriptCode({
          moduleName: testCase.fixture,
          className: _.capitalize(testCase.fixture) + 'Api',
          swagger: swagger,
          lint: false,
          beautify: true
      });

      if (fs.existsSync(expectedPath)) {
          var expected = fs.readFileSync(expectedPath, 'UTF-8');
          expect(actual).toBe(expected)
      } else {
          fs.writeFileSync(expectedPath, actual)
      }
    })
  })
})
