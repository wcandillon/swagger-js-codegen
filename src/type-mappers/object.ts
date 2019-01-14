import { makeTypeSpecFromSwaggerType, TypeSpec } from "../typespec";
import { map, filter, flatten, includes, concat, isArray } from "lodash";
import { SwaggerType } from "../swagger/Swagger";
import { Swagger } from "../swagger/Swagger";
import { convertType } from "../typescript";

export interface ObjectTypeSpec extends TypeSpec {
  readonly tsType: "object";
  readonly isAtomic: false;
  readonly isObject: true;
  readonly requiredPropertyNames: ReadonlyArray<string>;
  readonly properties: ReadonlyArray<TypeSpec>;
}

export function makeObjectTypeSpec(
  swaggerType: SwaggerType,
  swagger: Swagger
): ObjectTypeSpec {
  // TODO: We threat everything that reaches this point as an object but not the required properties? (Removing the check for object makes the tests fail)
  const requiredPropertyNames =
    swaggerType.type === "object" && isArray(swaggerType.required)
      ? swaggerType.required
      : [];
  const properties = concat(
    getAllOfProperties(swaggerType, swagger),
    getObjectProperties(swaggerType, swagger, requiredPropertyNames)
  );

  return {
    ...makeTypeSpecFromSwaggerType(swaggerType),
    tsType: "object",
    isObject: true,
    isAtomic: false,
    properties,
    requiredPropertyNames
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
