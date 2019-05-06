import { convertType } from "../typescript";
import { HttpOperation, Swagger } from "../swagger/Swagger";

const defaultResponseType = "void";

export const getResponseTypes = (op: HttpOperation, swagger: Swagger): string =>
  Object.keys(op.responses)
    .map(key => op.responses[key])
    .map(swaggerType => convertType(swaggerType, swagger))
    .map(typeSpec => typeSpec.target || typeSpec.tsType || defaultResponseType)
    .join(" | ");
