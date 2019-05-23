import { makeTypeSpecFromSwaggerType, TypeSpec } from "../typespec";
// import {
//   map,
//   filter,
//   flatten,
//   includes,
//   concat,
//   isArray,
//   uniqBy,
//   reverse
// } from "lodash";
import { SwaggerType } from "../swagger/Swagger";
//import { Swagger } from "../swagger/Swagger";
//import { convertType } from "../typescript";

export interface VoidTypeSpec extends TypeSpec {
  readonly tsType: "void";
  //readonly isAtomic: false;
  //readonly isObject: true;
  //readonly requiredPropertyNames: ReadonlyArray<string>;
  //readonly properties: ReadonlyArray<TypeSpec>;
}

/**
 * 3.0
 * To indicate the response body is empty, do not specify a content for the response
 * https://swagger.io/docs/specification/describing-responses/#empty
 *
 * 2.0
 * To indicate the response body is empty, do not specify a schema for the response.
 * Swagger treats no schema as a response without a body.
 * https://swagger.io/docs/specification/2-0/describing-responses/
 */
export const isVoidType = (swaggerType: SwaggerType): boolean =>
  swaggerType.$ref === undefined &&
  swaggerType.allOf === undefined &&
  (swaggerType.minItems as number | undefined) === undefined &&
  swaggerType.properties === undefined;

export const makeVoidTypeSpec = (swaggerType: SwaggerType): VoidTypeSpec => ({
  ...makeTypeSpecFromSwaggerType(swaggerType),
  tsType: "void",
  isAtomic: true
});
