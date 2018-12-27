import { makeTypeSpecFromSwaggerType, TypeSpec } from "../typespec";
import { convertType } from "../typescript";
import { SwaggerDictionary, SwaggerType } from "../swagger/Swagger";
import { Swagger } from "../swagger/Swagger";

export interface DictionaryTypeSpec extends TypeSpec {
    readonly tsType: string;
    readonly isAtomic: false;
    readonly isDictionary: true,
    readonly isArray: false,
    readonly elementType: TypeSpec
}

export function makeDictionaryTypeSpec(swaggerType: SwaggerDictionary, swagger: Swagger): DictionaryTypeSpec {
    const elementTypeSpec = convertType(swaggerType.additionalProperties, swagger);

    return {
        ...makeTypeSpecFromSwaggerType(swaggerType),
        elementType: elementTypeSpec,
        tsType: `{ [key: string]: ${elementTypeSpec.target || elementTypeSpec.tsType || 'any'} }`,
        isArray: false,
        isAtomic: false,
        isDictionary: true
    };
}

export function isDictionary(swaggerType: SwaggerType): swaggerType is SwaggerDictionary {
    return swaggerType.type === 'object' && swaggerType.hasOwnProperty('additionalProperties');
}
