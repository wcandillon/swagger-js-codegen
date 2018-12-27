import { makeTypeSpecFromSwaggerType, TypeSpec } from "../typespec";
import { isString }  from "lodash";
import { SwaggerReference, SwaggerType } from '../swagger/Swagger';

export interface ReferenceTypeSpec extends TypeSpec {
    readonly tsType: 'ref',
    readonly target: string,
    readonly isRef: true,
}

export function makeReferenceTypeSpec(swaggerType: SwaggerReference): ReferenceTypeSpec {
    return {
        ...makeTypeSpecFromSwaggerType(swaggerType),
        target: swaggerType.$ref.substring(swaggerType.$ref.lastIndexOf('/') + 1),
        tsType: 'ref',
        isRef:  true,
    };
}

export function isReference(swaggerType: SwaggerType): swaggerType is SwaggerReference {
    return isString(swaggerType.$ref);
}
