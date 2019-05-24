import { makeTypeSpecFromSwaggerType, TypeSpec } from "../typespec";
import { SwaggerType } from "../swagger/Swagger";

export interface VoidTypeSpec extends TypeSpec {
  readonly tsType: "void";
}

/**
 * Determines if a plain swagger schema SwaggerType should be annotated as a typescript VoidTypeSpec.
 *
 * 3.0 spec
 * To indicate the response body is empty, do not specify a content for the response
 * https://swagger.io/docs/specification/describing-responses/#empty
 *
 * 2.0 spec
 * To indicate the response body is empty, do not specify a schema for the response.
 * Swagger treats no schema as a response without a body.
 * https://swagger.io/docs/specification/2-0/describing-responses/
 *
 * @param {SwaggerType} swaggerType - The SwaggerType.
 * @returns {boolean} A boolean indicating that the SwaggerType should be annotated as a void typescript type.
 */
export const isVoidType = (swaggerType: SwaggerType): boolean =>
  (swaggerType.type as string | undefined) === undefined &&
  (swaggerType.required as boolean | string[] | undefined) === undefined &&
  swaggerType.$ref === undefined &&
  swaggerType.allOf === undefined &&
  (swaggerType.minItems as number | undefined) === undefined &&
  swaggerType.properties === undefined;

/**
 * Converts a plain swagger schema SwaggerType to an annotated typescript swagger VoidTypeSpec.
 * By adding void type typescript type annotations.
 *
 * @param {SwaggerType} swaggerType - A SwaggerType.
 * @returns {VoidTypeSpec} A VoidTypeSpec.
 */
export const makeVoidTypeSpec = (swaggerType: SwaggerType): VoidTypeSpec => ({
  ...makeTypeSpecFromSwaggerType(swaggerType),
  tsType: "void",
  isAtomic: true
});
