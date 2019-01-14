import { map, entries } from "lodash";
import { SwaggerType, Swagger } from "../swagger/Swagger";
import { TypeSpec } from "../typespec";
import { convertType } from "../typescript";

export interface Definition {
    name: string; 
    description: string | undefined;
    tsType: TypeSpec;
}

export function makeDefinitionsFromSwaggerDefinitions(swaggerDefinitions: { [index: string]: SwaggerType }, swagger: Swagger): Definition[] {
    return map(entries(swaggerDefinitions), ([name, swaggerDefinition]) => ({
        name,
        description: swaggerDefinition.description,
        tsType: convertType(swaggerDefinition, swagger)
    })); 
}
