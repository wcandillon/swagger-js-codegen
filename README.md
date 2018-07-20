# Swagger to JS & Typescript Codegen

This package generates a typescript or javascript class from a [swagger specification url](https://github.com/wordnik/swagger-spec). The code is generated using [mustache templates](https://github.com/wcandillon/swagger-js-codegen/tree/master/lib/templates) and beautified by [prettier](https://github.com/prettier/prettier).

## Installation
```bash
npm install https://github.com/bart-sk/swagger-js-codegen
```
or
```
yarn add https://github.com/bart-sk/swagger-js-codegen
```

## Example
### CLI
`npx swagger2js generate {swaggerUrl} --type javascript > api.js`

Be sure to specify absolute swagger url to swagger.json. Resulting class can be retrieved on stdout.

```
-t, --type
Either "javascript" or "typescript" (default: typescript)

--tags
Filter tags in swagger spec

-c --class
Class name (default: Api)
```

### In package.json
```
  "scripts": {
    ...
    "generate-api": "npx swagger2js generate {swaggerUrl} > api.ts",
    ...
  },
```