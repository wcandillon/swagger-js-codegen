import { makeTypeSpecFromSwaggerType, TypeSpec } from "../typespec";
import { SwaggerString, SwaggerType } from "../swagger/Swagger";

export interface StringTypeSpec extends TypeSpec {
    readonly tsType: 'string';
    readonly isAtomic: true;
}

export function makeStringTypeSpec(swaggerType: SwaggerString): StringTypeSpec {
    return {
        ...makeTypeSpecFromSwaggerType(swaggerType),
        tsType: 'string',
        isAtomic: true,
    };
}

export function isString(swaggerType: SwaggerType): swaggerType is SwaggerString {
    return swaggerType.type === 'string'
}
