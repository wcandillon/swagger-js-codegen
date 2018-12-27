import { convertType } from "../typescript";
import { TypeSpec, makeTypeSpecFromSwaggerType } from "../typespec";
import { SwaggerArray, SwaggerType } from "../swagger/Swagger";
import { Swagger } from "../swagger/Swagger";

export interface ArrayTypeSpec extends TypeSpec {
    readonly tsType: string;
    readonly isAtomic: false;
    readonly isArray: true;
    readonly elementType: TypeSpec
}

export function makeArrayTypeSpec(swaggerType: SwaggerArray, swagger: Swagger): ArrayTypeSpec {
    const elementTypeSpec = convertType(swaggerType.items, swagger);

    return {
        ...makeTypeSpecFromSwaggerType(swaggerType),
        elementType: elementTypeSpec,
        tsType: `Array<${elementTypeSpec.target || elementTypeSpec.tsType || 'any'}>`,
        isArray: true,
        isAtomic: false,
    };
}

export function isArray(swaggerType: SwaggerType): swaggerType is SwaggerArray {
    return swaggerType.type === 'array';
}
