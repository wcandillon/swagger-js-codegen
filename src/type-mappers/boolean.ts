import { TypeSpec, makeTypeSpecFromSwaggerType } from "../typespec";
import { SwaggerBoolean, SwaggerType } from "../swagger/Swagger";

export interface BooleanTypeSpec extends TypeSpec {
    readonly tsType: 'boolean';
    readonly isAtomic: true;
}

export function makeBooleanTypeSpec(swaggerType: SwaggerBoolean): BooleanTypeSpec {
    return {
        ...makeTypeSpecFromSwaggerType(swaggerType),
        tsType: 'boolean',
        isAtomic: true,
    };
}

export function isBoolean(swaggerType: SwaggerType): swaggerType is SwaggerBoolean {
    return swaggerType.type === 'boolean';
}
