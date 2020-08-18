import { makeTypeSpecFromSwaggerType, TypeSpec } from "../typespec";
import {
  map,
  filter,
  flatten,
  includes,
  concat,
  isArray,
  uniqBy,
  reverse
} from "lodash";
import { SwaggerType } from "../swagger/Swagger";
import { Swagger } from "../swagger/Swagger";
import { convertType } from "../typescript";
import { makeAnyTypeSpec } from "./any";

export interface ObjectTypeSpec extends TypeSpec {
  readonly tsType: "object";
  readonly isAtomic: false;
  readonly isObject: true;
  readonly requiredPropertyNames: ReadonlyArray<string>;
  readonly properties: ReadonlyArray<TypeSpec>;
  readonly hasAdditionalProperties: boolean;
  readonly additionalPropertiesType: TypeSpec | undefined;
}

// see: https://support.reprezen.com/support/solutions/articles/6000162892-support-for-additionalproperties-in-swagger-2-0-schemas
export function extractAdditionalPropertiesType(
  swaggerType: SwaggerType,
  swagger: Swagger
): TypeSpec | undefined {
  if (swaggerType.type && swaggerType.type !== "object") {
    return undefined;
  }
  if (swaggerType.additionalProperties === false) {
    return undefined;
  }
  if (
    swaggerType.additionalProperties === undefined ||
    swaggerType.additionalProperties === true
  ) {
    // is there an easier way to make an "any" type?
    return makeAnyTypeSpec({
      type: "object",
      required: [],
      minItems: 0,
      title: "any",
      properties: {}
    });
  }
  return convertType(swaggerType.additionalProperties, swagger);
}

export function makeObjectTypeSpec(
  swaggerType: SwaggerType,
  swagger: Swagger
): ObjectTypeSpec {
  // TODO: We threat everything that reaches this point as an object but not the required properties? (Removing the check for object makes the tests fail)
  // NOTE: object might not be set, because everything without a type is treated as object.
  const requiredPropertyNames =
    (!swaggerType.type || swaggerType.type === "object") &&
    isArray(swaggerType.required)
      ? swaggerType.required
      : [];

  // Some special handling is needed to support overlapping properties. The list of properties must be reversed to get the
  // overriding properties first. Only then can we filter out any duplicates. To get the original order back, the array
  // is reversed once more
  const allProperties = concat(
    getAllOfProperties(swaggerType, swagger),
    getObjectProperties(swaggerType, swagger, requiredPropertyNames)
  );
  const uniqueProperties = uniqBy(reverse(allProperties), "name");
  const properties = reverse(uniqueProperties);

  const addPropsType = extractAdditionalPropertiesType(swaggerType, swagger);

  return {
    ...makeTypeSpecFromSwaggerType(swaggerType),
    tsType: "object",
    isObject: true,
    isAtomic: false,
    properties,
    requiredPropertyNames,
    hasAdditionalProperties: addPropsType !== undefined,
    additionalPropertiesType: addPropsType
  };
}

function getObjectProperties(
  swaggerType: SwaggerType,
  swagger: Swagger,
  requiredPropertyNames: ReadonlyArray<string>
): TypeSpec[] {
  return map(swaggerType.properties, (propertyType, propertyName) => ({
    ...convertType(propertyType, swagger),
    name: propertyName,
    isRequired: includes(requiredPropertyNames, propertyName)
  }));
}

function getAllOfProperties(
  swaggerType: SwaggerType,
  swagger: Swagger
): TypeSpec[] {
  if (!swaggerType.allOf) {
    return [];
  }

  return flatten(
    map(swaggerType.allOf, ref => {
      if (!ref.$ref) {
        const property = convertType(ref, swagger);
        return filter(property.properties);
      }

      const refSegments = ref.$ref.split("/");
      const name = refSegments[refSegments.length - 1];

      return flatten(
        filter(
          map(
            filter(
              swagger.definitions,
              (__, definitionName) => definitionName === name
            ),
            definition => {
              const property = convertType(definition, swagger);

              return property.properties;
            }
          ),
          isArray
        )
      );
    })
  );
}
