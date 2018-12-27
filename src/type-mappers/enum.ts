import { makeTypeSpecFromSwaggerType, TypeSpec } from "../typespec";
import { SwaggerEnum, SwaggerType } from '../swagger/Swagger';

export interface EnumTypeSpec extends TypeSpec {
    readonly tsType: string;
    readonly isAtomic: true;
    readonly isEnum: true;
    readonly enum: ReadonlyArray<string>;
}

export function makeEnumTypeSpec(swaggerType: SwaggerEnum): EnumTypeSpec {
    return {
        ...makeTypeSpecFromSwaggerType(swaggerType),
        tsType: swaggerType.enum.map((str) => JSON.stringify(str)).join(' | '),
        enum: swaggerType.enum,
        isEnum: true,
        isAtomic: true,
    }
}

export function isEnum(swaggerType: SwaggerType): swaggerType is SwaggerEnum {
    return Boolean(swaggerType.hasOwnProperty('enum') && (swaggerType as { enum?: any }).enum);
}
