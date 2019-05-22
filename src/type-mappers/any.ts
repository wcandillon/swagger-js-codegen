import { TypeSpec, makeTypeSpecFromSwaggerType } from "../typespec";
import { SwaggerType } from "../swagger/Swagger";

export interface AnyTypeSpec extends TypeSpec {
  readonly tsType: "any";
  readonly isAtomic: true;
}

export const isAnyTypeSpec = (swaggerType: SwaggerType): boolean =>
  swaggerType.minItems >= 0 &&
  swaggerType.hasOwnProperty("title") &&
  !swaggerType.$ref;

export function makeAnyTypeSpec(swaggerType: SwaggerType): AnyTypeSpec {
  return {
    ...makeTypeSpecFromSwaggerType(swaggerType),
    tsType: "any",
    isAtomic: true
  };
}
