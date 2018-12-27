// TODO: This file can probably be replaced by some open source OpenAPI definition package
type SwaggerTypes = 'object' | 'string' | 'boolean' | 'number' | 'integer' | 'array' | 'enum' | 'schema' | 'reference';

export interface SwaggerType {
    readonly description?: string;
    readonly required: boolean | ReadonlyArray<string>;
    readonly type: SwaggerTypes;
    readonly properties: {
        [index: string]: SwaggerType;
    };
    readonly allOf?: ReadonlyArray<SwaggerType>;
    readonly minItems: number;
    readonly title?: string;
    readonly $ref?: string;
}

export interface SwaggerArray extends SwaggerType {
    readonly type: 'array'
    readonly items: SwaggerType;
}

export interface SwaggerDictionary extends SwaggerType {
    readonly additionalProperties: SwaggerType;
}

export interface SwaggerBoolean extends SwaggerType {
    readonly type: 'boolean';
}

export interface SwaggerString extends SwaggerType {
    readonly type: 'string';
}

export interface SwaggerNumber extends SwaggerType {
    readonly type: 'number' | 'integer';
}

export interface SwaggerReference extends SwaggerType {
    readonly type: 'reference';
    readonly $ref: string;
}

export interface SwaggerSchema extends SwaggerType {
    readonly schema: SwaggerType;
}

export interface SwaggerEnum extends SwaggerType {
    readonly type: 'enum';
    readonly enum: ReadonlyArray<string>;
}

interface Parameter {}

export interface Scheme {}

export interface Security {}

export interface SecurityDefinition {
    // TODO: I don't know what this should be
    type: any;
}

export interface HttpOperation {
    deprecated: boolean;
    security: boolean;
    responses: {
        200: SwaggerType;
    },
    operationId: string;
    description: string;
    summary: string;
    externalDocs: string;
    produces: ReadonlyArray<string>;
    consumes:  ReadonlyArray<string>;
    parameters: ReadonlyArray<string>;
}

export interface Swagger {
    swagger: string;
    security: ReadonlyArray<Security>
    securityDefinitions: { [index: string]: SecurityDefinition } | undefined;
    schemes: ReadonlyArray<Scheme>;
    host: string;
    basePath: string;
    info: {
        description: string;
    },
    paths: {
        // Api Path
        [index: string]: {
            // Api Method for Path e.g. GET / POST /DELETE
            [index: string]: HttpOperation
        }
    };
    definitions: {
        [index: string]: SwaggerType;
    },
    parameters: ReadonlyArray<Parameter>;
    produces: ReadonlyArray<string>;
    consumes:  ReadonlyArray<string>;
}
