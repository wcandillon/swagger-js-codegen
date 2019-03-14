import { TypeSpec, makeTypeSpecFromSwaggerType } from "../typespec";
import { SwaggerType } from "../swagger/Swagger";

export interface AnyTypeSpec extends TypeSpec {
  readonly tsType: "any";
  readonly isAtomic: true;
}

export function makeAnyTypeSpec(swaggerType: SwaggerType): AnyTypeSpec {
  return {
    ...makeTypeSpecFromSwaggerType(swaggerType),
    tsType: "any",
    isAtomic: true
  };
}
