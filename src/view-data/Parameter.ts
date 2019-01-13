// TODO: This file needs some love <3
import {
    camelCase,
    isString,
} from 'lodash/fp';
import { convertType } from '../typescript';
import { TypeSpec } from '../typespec';
import { Swagger, Parameter } from '../swagger/Swagger';

export interface TypeSpecParameter extends Parameter {
    isBodyParameter: boolean;
    isPathParameter: boolean;
    isQueryParameter: boolean;
    isHeaderParameter: boolean;
    isFormParameter: boolean;
    tsType: TypeSpec | undefined; // TODO: This can not be undefined?
    cardinality: '' | '?';
}

function makeTypespecParameterFromSwaggerParameter(parameter: Parameter, swagger: Swagger): TypeSpecParameter {
    return {
        ...parameter,
        camelCaseName: camelCase(parameter.name),
        isBodyParameter: false,
        isPathParameter: false,
        isQueryParameter: false,
        isHeaderParameter: false,
        isFormParameter: false,
        cardinality: parameter.required ? '' : '?',
        tsType: convertType(parameter, swagger),
    };
}

export function makeTypeSpecTypeParameter(parameter: Parameter, swagger: Swagger): TypeSpecParameter {
    if (isString(parameter.$ref)) {
        const segments = parameter.$ref.split('/');
        parameter = swagger.parameters[segments.length === 1 ? segments[0] : segments[2] ];
    }

    switch(parameter.in) {
        case 'body':
            return makeBodyParameter(parameter, swagger);
            break;
        case 'path':
            return makePathParameter(parameter, swagger);
            break;
        case 'query':
            return makeQueryParameter(parameter, swagger);
            break;
        case 'header':
            return makeHeaderParameter(parameter, swagger);
            break;
        case 'formData':
            return makeFormParameter(parameter, swagger);
            break;
        default: 
            neverGuard(parameter.in);
    }

    throw new Error('Unsupported parameter type');
}

function neverGuard(_v: never): void {}

interface BodyParameter extends TypeSpecParameter {
    isBodyParameter: true;
}

function makeBodyParameter(parameter: Parameter, swagger: Swagger): BodyParameter {
    return {
        ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
        isBodyParameter: true,
    };
}

interface PathParameter extends TypeSpecParameter {
    isPathParameter: true;
}

function makePathParameter(parameter: Parameter, swagger: Swagger): PathParameter {
    return {
        ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
        isPathParameter: true,
    };
}

interface QueryParameter extends TypeSpecParameter {
    isQueryParameter: true;
    isPatternType: boolean;
    pattern: string | undefined;
}

function makeQueryParameter(parameter: Parameter, swagger: Swagger): QueryParameter {
    return {
        ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
        isQueryParameter: true,
        pattern: parameter['x-name-pattern'],
        isPatternType: parameter['x-name-pattern'] !== undefined
    };
}

interface HeaderParameter extends TypeSpecParameter {
    isHeaderParameter: true;
}

function makeHeaderParameter(parameter: Parameter, swagger: Swagger): HeaderParameter {
    return {
        ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
        isHeaderParameter: true,
    };
}

interface FormParameter extends TypeSpecParameter {
    isFormParameter: true;
}

function makeFormParameter(parameter: Parameter, swagger: Swagger): FormParameter {
    return {
        ...makeTypespecParameterFromSwaggerParameter(parameter, swagger),
        isFormParameter: true,
    };
}
