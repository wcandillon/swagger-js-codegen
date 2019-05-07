import { convertType } from "../typescript";
import { HttpOperation, Swagger, SwaggerType } from "../swagger/Swagger";
import { values, uniq } from "lodash/fp";

const defaultResponseType = "void";

export const getResponseTypes = (op: HttpOperation, swagger: Swagger): string =>
  uniq(
    values(op.responses)
      .map(swaggerType => convertType(swaggerType, swagger))
      .map(
        typeSpec => typeSpec.target || typeSpec.tsType || defaultResponseType
      )
  ).join(" | ");

// https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#2xx_Success
/** @deprecated use getResponseTypes instead, this function will be removed in a future version. */
const successfulCodes = [
  "200", // OK
  "201", // Created
  "202", // Accepted
  "203", // Non-Authoritative Information
  "204", // No Content
  "205", // Reset Content
  "206", // Partial Content
  "207", // Multi-Status
  "208", // Already Reported
  "226" // IM Used
];

/** @deprecated use getResponseTypes instead, this function will be removed in a future version. */
function onlySuccessful(statusCode: string) {
  return successfulCodes.includes(statusCode);
}

/** @deprecated use getResponseTypes instead, this function will be removed in a future version. */
function getSuccessfulResponse(op: HttpOperation): SwaggerType {
  const definedSuccessCodes = Object.keys(op.responses).filter(onlySuccessful);

  if (definedSuccessCodes.length === 0) {
    throw new Error("No success responses defined");
  }

  return op.responses[definedSuccessCodes[0]];
}

/** @deprecated use getResponseTypes instead, this function will be removed in a future version. */
export function getSuccessfulResponseType(
  op: HttpOperation,
  swagger: Swagger
): [string, boolean] {
  let successfulResponseTypeIsRef = false;
  let successfulResponseType;

  try {
    const successfulResponse = getSuccessfulResponse(op);
    const convertedType = convertType(successfulResponse, swagger);

    if (convertedType.target) {
      successfulResponseTypeIsRef = true;
    }

    successfulResponseType =
      convertedType.target || convertedType.tsType || defaultResponseType;
  } catch (error) {
    successfulResponseType = defaultResponseType;
  }

  return [successfulResponseType, successfulResponseTypeIsRef];
}
