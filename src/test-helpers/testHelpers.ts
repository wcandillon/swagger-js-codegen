import { merge } from "lodash";
import { Swagger } from "../swagger/Swagger";
import {
  SwaggerType,
  SwaggerEnum,
  SwaggerArray,
  SwaggerDictionary
} from "../swagger/Swagger";
import { TypeSpec } from "../typespec";

export function makeFakeSwagger(): Swagger {
  return {} as Swagger;
}

export function makeSwaggerType(
  overrides: Partial<
    SwaggerEnum | SwaggerType | SwaggerArray | SwaggerDictionary
  > & { type: SwaggerType["type"] }
): SwaggerType {
  return merge(
    {
      description: undefined,
      $ref: undefined,
      required: [],
      type: overrides.type,
      properties: {},
      allOf: undefined,
      minItems: 0
    },
    overrides
  );
}

export function makeEmptyTypeSpec(): TypeSpec {
  return {
    name: undefined,
    description: undefined,
    isEnum: false,
    isArray: false,
    isDictionary: false,
    isObject: false,
    isRef: false,
    isNullable: false,
    isRequired: true,
    tsType: undefined,
    isAtomic: false,
    target: undefined,
    properties: undefined
  };
}
