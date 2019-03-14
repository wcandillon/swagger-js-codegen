import * as _ from "lodash";
import { Swagger, SwaggerType } from "./swagger/Swagger";
import { makeObjectTypeSpec } from "./type-mappers/object";
import { makeReferenceTypeSpec, isReference } from "./type-mappers/reference";
import { makeEnumTypeSpec, isEnum } from "./type-mappers/enum";
import { TypeSpec } from "./typespec";
import { makeStringTypeSpec, isString } from "./type-mappers/string";
import { makeNumberTypeSpec, isNumber } from "./type-mappers/number";
import { makeBooleanTypeSpec, isBoolean } from "./type-mappers/boolean";
import { makeArrayTypeSpec, isArray } from "./type-mappers/array";
import {
  makeDictionaryTypeSpec,
  isDictionary
} from "./type-mappers/dictionary";
import { makeAnyTypeSpec } from "./type-mappers/any";
import { isSchema } from "./type-mappers/schema";

/**
 * Recursively converts a swagger type description into a typescript type, i.e., a model for our mustache
 * template.
 *
 * Not all type are currently supported, but they should be straightforward to add.
 *
 * @param swaggerType a swagger type definition, i.e., the right hand side of a swagger type definition.
 * @param swagger the full swagger spec object
 * @returns a recursive structure representing the type, which can be used as a template model.
 */
export function convertType(
  swaggerType: SwaggerType,
  swagger: Swagger
): TypeSpec {
  if (isSchema(swaggerType)) {
    return convertType(swaggerType.schema, swagger);
  } else if (isReference(swaggerType)) {
    return makeReferenceTypeSpec(swaggerType);
  } else if (isEnum(swaggerType)) {
    return makeEnumTypeSpec(swaggerType);
  } else if (isString(swaggerType)) {
    return makeStringTypeSpec(swaggerType);
  } else if (isNumber(swaggerType)) {
    return makeNumberTypeSpec(swaggerType);
  } else if (isBoolean(swaggerType)) {
    return makeBooleanTypeSpec(swaggerType);
  } else if (isArray(swaggerType)) {
    return makeArrayTypeSpec(swaggerType, swagger);
  } else if (isDictionary(swaggerType)) {
    // case where a it's a Dictionary<string, someType>
    return makeDictionaryTypeSpec(swaggerType, swagger);
  } else if (
    swaggerType.minItems >= 0 &&
    swaggerType.hasOwnProperty("title") &&
    !swaggerType.$ref
  ) {
    return makeAnyTypeSpec(swaggerType);
  }

  // Remaining types are created as objects
  return makeObjectTypeSpec(swaggerType, swagger);
}
