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

export interface SwaggerType {
    readonly description: string;
    readonly $ref: string;
    readonly required: ReadonlyArray<string>;
    readonly type: 'object' | 'string' | 'boolean' | 'number' | 'integer' | 'array'
    readonly schema: SwaggerType;
    readonly enum: ReadonlyArray<string> | undefined;
    readonly items: SwaggerType;
    readonly properties: {
        [index: string]: SwaggerType;
    };
    readonly additionalProperties: SwaggerType;
    readonly allOf: ReadonlyArray<SwaggerType> | undefined;
    readonly minItems: number;
    readonly title: string | undefined;
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
