import { SwaggerType, SwaggerSchema } from "../swagger/Swagger";

export function isSchema(swaggerType: SwaggerType): swaggerType is SwaggerSchema {
    return swaggerType.hasOwnProperty('schema');
}
