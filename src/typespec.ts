import { SwaggerType } from "./swagger/Swagger";

type TsType = 'string' | 'number' | 'boolean' | 'ref';

export interface TypeSpec {
    readonly name: string | undefined,
    readonly description: string | undefined;
    readonly isEnum: boolean;
    readonly isArray: boolean;
    readonly isObject: boolean;
    readonly isRef: boolean;
    readonly isAtomic: boolean;
    readonly isDictionary: boolean;
    readonly isNullable: boolean;
    readonly isRequired: boolean;
    readonly tsType: TsType | string | undefined;
    readonly target: string | undefined;
    readonly properties: ReadonlyArray<TypeSpec> | undefined;
}

export function makeTypeSpecFromSwaggerType(swaggerType: SwaggerType): Readonly<TypeSpec> {
    return {
        name: undefined,
        description: swaggerType.description,
        isEnum: false,
        isArray: false,
        isDictionary: false,
        isObject: false,
        isRef: false,
        isNullable: !swaggerType.required,
        isRequired: Boolean(swaggerType.required),
        tsType: undefined,
        isAtomic: false,
        target: undefined,
        properties: undefined
    };
}