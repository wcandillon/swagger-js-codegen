import { camelCase, isString } from "lodash/fp";
import { convertType } from "../typescript";
import { TypeSpec } from "../typespec";
import { Swagger, Parameter } from "../swagger/Swagger";

export interface TypeSpecParameter extends Parameter {
  readonly isBodyParameter: boolean;
  readonly isPathParameter: boolean;
  readonly isQueryParameter: boolean;
  readonly isHeaderParameter: boolean;
  readonly isFormParameter: boolean;
  readonly tsType: TypeSpec;
  readonly cardinality: "" | "?";
}

//Ignore parameters which contain the x-exclude-from-bindings extension
const isExcludeFromBindingHeader = (parameter: Parameter) =>
  parameter["x-exclude-from-bindings"] === true;

// Ignore headers which are injected by proxies & app servers
// eg: https://cloud.google.com/appengine/docs/go/requests#Go_Request_headers
const isProxyHeader = (parameter: Parameter) =>
  parameter["x-exclude-from-bindings"] === true;

const isNotParameterToBeIgnored = (parameter: Parameter) =>
  !isExcludeFromBindingHeader(parameter) && !isProxyHeader(parameter);

export const getParametersForMethod = (
  globalParams: ReadonlyArray<Parameter>,
  params: ReadonlyArray<Parameter> = [],
  swagger: Swagger
): TypeSpecParameter[] =>
  params
    .concat(globalParams)
    .filter(isNotParameterToBeIgnored)
    .map((parameter: Parameter) => makeTypeSpecParameter(parameter, swagger));

function makeTypespecParameterFromSwaggerParameter(
  parameter: Parameter,
  swagger: Swagger
): TypeSpecParameter {
  const isSingleton = parameter.enum && parameter.enum.length === 1;

  return {
    ...parameter,
    camelCaseName: camelCase(parameter.name),
    isBodyParameter: false,
    isPathParameter: false,
    isQueryParameter: false,
    isHeaderParameter: false,
    isFormParameter: false,
    cardinality: parameter.required ? "" : "?",
    tsType: convertType(parameter, swagger),
    isSingleton,
    singleton: isSingleton ? parameter.enum[0] : undefined
  };
}

function makeTypeSpecParameter(
  parameter: Parameter,
  swagger: Swagger
): TypeSpecParameter {
  if (isString(parameter.$ref)) {
    const segments = parameter.$ref.split("/");
    parameter =
      swagger.parameters[segments.length === 1 ? segments[0] : segments[2]];
  }

  switch (parameter.in) {
    case "body":
      return makeBodyParameter(parameter, swagger);
      break;
    case "path":
      return makePathParameter(parameter, swagger);
      break;
    case "query":
      return makeQueryParameter(parameter, swagger);
      break;
    case "header":
      return makeHeaderParameter(parameter, swagger);
      break;
    case "formData":
      return makeFormParameter(parameter, swagger);
      break;
    default:
      neverGuard(parameter.in);
  }

  throw new Error("Unsupported parameter type");
}

function neverGuard(_v: never): void {}

interface BodyParameter extends TypeSpecParameter {
  readonly isBodyParameter: true;
}

function makeBodyParameter(
  parameter: Parameter,
  swagger: Swagger
): BodyParameter {
  return {
    ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
    isBodyParameter: true
  };
}

interface PathParameter extends TypeSpecParameter {
  readonly isPathParameter: true;
}

function makePathParameter(
  parameter: Parameter,
  swagger: Swagger
): PathParameter {
  return {
    ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
    isPathParameter: true
  };
}

interface QueryParameter extends TypeSpecParameter {
  readonly isQueryParameter: true;
  readonly isPatternType: boolean;
  readonly pattern: string | undefined;
}

function makeQueryParameter(
  parameter: Parameter,
  swagger: Swagger
): QueryParameter {
  return {
    ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
    isQueryParameter: true,
    pattern: parameter["x-name-pattern"],
    isPatternType: parameter["x-name-pattern"] !== undefined
  };
}

interface HeaderParameter extends TypeSpecParameter {
  readonly isHeaderParameter: true;
}

function makeHeaderParameter(
  parameter: Parameter,
  swagger: Swagger
): HeaderParameter {
  return {
    ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
    isHeaderParameter: true
  };
}

interface FormParameter extends TypeSpecParameter {
  readonly isFormParameter: true;
}

function makeFormParameter(
  parameter: Parameter,
  swagger: Swagger
): FormParameter {
  return {
    ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
    isFormParameter: true
  };
}
